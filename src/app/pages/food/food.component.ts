import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { FoodDialogComponent, FoodDialogData } from '@components/dialogs/food/food-dialog.component';
import { LocalFoodListComponent, OpenFoodFactsFoodListComponent } from '@components/food-list/food-list.component';
import { MealfoodFormComponent } from '@components/forms/mealfood-form/mealfood-form.component';
import { Food, FoodDTO } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { OpenFoodFactsService } from '@services/open-food-facts.service';
import { cancel, checkPermissions, Format, requestPermissions, scan } from '@tauri-apps/plugin-barcode-scanner';
import { debounceTime, distinctUntilChanged, lastValueFrom, switchMap } from 'rxjs';

@Component({
    selector: 'app-page-food',
    standalone: true,
    imports: [
        CommonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        LocalFoodListComponent,
        MealfoodFormComponent,
        OpenFoodFactsFoodListComponent,
    ],
    templateUrl: './food.component.html',
    styleUrl: './food.component.css',
})
export class FoodPageComponent implements OnInit {
    route = inject(ActivatedRoute);
    dialog = inject(MatDialog);
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    openFoodFactsService = inject(OpenFoodFactsService);

    searchText = new FormControl<string | Food>('', { nonNullable: true });
    // Signal equivalent of the exact search at all times
    searchTextSignal = toSignal(this.searchText.valueChanges, { initialValue: '' });
    // How we can check if we have a string or a food
    searchTextIsFood = computed(() => {
        return typeof this.searchTextSignal() === 'string' ? false : true;
    });
    // Only local search when checkbox isn't checked and vice versa
    foods = toSignal(
        this.searchText.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchTerm => (this.onlineSearch.value ? [] : this.search(searchTerm)))
        ),
        { initialValue: [] as Food[] }
    );
    onlineSearch = new FormControl<boolean>(false, { nonNullable: true });
    onlineFoods = signal<Array<FoodDTO>>([]);
    /**
     * Boolean to track whether an online search is in progress
     */
    searching = signal<boolean>(false);

    /**
     * Optional input parameter telling us if we're looking for food for a specific meal
     */
    mealId: number | undefined = undefined;
    meal: Meal | undefined = undefined;

    canScan = signal<boolean>(this.databaseService.isMobilePlatform());

    displayFoods(food: Food): string {
        return food && food.description ? food.description : '';
    }

    async scan() {
        const permission = await checkPermissions();
        if (permission !== 'granted') {
            if ((await requestPermissions()) !== 'granted') {
                return;
            }
        }
        // Close the scanner after 10 seconds
        let scanTimeout: number | null = window.setTimeout(() => {
            scanTimeout = null;
            cancel();
        }, 10000);
        const tempScanResult = await scan({
            windowed: false,
            formats: [Format.EAN13, Format.EAN8, Format.UPC_A, Format.UPC_E],
        });
        // If the timeout isn't null then we got a scan instead of a timeout
        if (scanTimeout) {
            clearTimeout(scanTimeout);
            const barcode = tempScanResult.content;
            if (this.onlineSearch.value) {
                // Online scan adds a new food
                const scanDto = await this.openFoodFactsService.searchByBarcode(barcode);
                this.addFood(scanDto);
            } else {
                //  Offline scans searches the DB
                const foods = await this.databaseService.getFoodsByBarcode(barcode);
                if (foods.length >= 1) {
                    // We find something in the DB
                    if (this.meal !== undefined) {
                        this.searchText.setValue(foods[0]);
                    } else {
                        this.searchText.setValue(foods[0].description);
                    }
                } else {
                    // We don't find the barcode, so we need to add it
                    // which means now we do the online scan path. This needs a refactor
                }
            }
        }
    }

    async search(searchTerm: string | Food): Promise<Array<Food>> {
        const searchTermParsed = typeof searchTerm === 'string' ? searchTerm : searchTerm?.description;
        return await this.databaseService.getFoodsBySearch(searchTermParsed);
    }

    async searchOnline(searchTerm: string | Food) {
        this.onlineFoods.set([]);
        this.searching.set(true);
        const searchTermParsed = typeof searchTerm === 'string' ? searchTerm : searchTerm?.description;
        const foods = await this.openFoodFactsService.searchByText(searchTermParsed);
        this.onlineFoods.set(foods);
        this.searching.set(false);
    }

    async onMealFoodSubmit(mealFood: MealFood) {
        const result = await this.databaseService.createMealFood(mealFood);
        // I'll be honest idk when this would ever happen
        if (!result) {
            console.error('Unable to add meal food!');
        }
        this.searchText.setValue('');
    }

    async addFood(existingData?: FoodDTO) {
        const dialogData: FoodDialogData = {
            modify: false,
            food: existingData,
        };
        const dialogRef = this.dialog.open(FoodDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            data: dialogData,
            disableClose: true,
        });
        const newFood: FoodDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newFood !== undefined) {
            const success = await this.databaseService.createFood(newFood);
            if (!success) {
                console.error('Failed to add food: ' + JSON.stringify(newFood));
            }
        }
    }

    constructor() {
        this.dateService.setTitle('Food');
    }

    async ngOnInit(): Promise<void> {
        const mealIdParam: string | undefined = this.route.snapshot.queryParams['meal'];
        if (mealIdParam) {
            this.mealId = Number(mealIdParam);
            this.meal = await this.databaseService.getMealById(this.mealId);
        }
    }
}
