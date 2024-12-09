import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { ScanService } from '@services/scan.service';
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
    // Stuff from outside this project
    route = inject(ActivatedRoute);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    // Stuff form this project
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    openFoodFactsService = inject(OpenFoodFactsService);
    scanService = inject(ScanService);

    /** Form control for local DB search */
    searchText = new FormControl<string>('', { nonNullable: true });
    /** Foods found after a local DB search */
    foods = toSignal(
        this.searchText.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            // Only local search when checkbox isn't checked and vice versa
            switchMap(searchTerm => (this.onlineSearch.value ? [] : this.search(searchTerm)))
        ),
        { initialValue: [] as Food[] }
    );
    /** Form control for online DB search */
    onlineSearch = new FormControl<boolean>(false, { nonNullable: true });
    /** Foods found after an online DB search */
    onlineFoods = signal<Array<FoodDTO>>([]);

    /** Boolean to track whether an online search is in progress */
    searching = signal<boolean>(false);

    /**
     * Optional input parameter telling us if we're looking for food for a specific meal
     *
     * This comes across as query parameter!
     */
    mealId: number | undefined = undefined;
    meal: Meal | undefined = undefined;
    addingToMeal = signal<boolean>(false);

    foodToAdd = signal<Food>(new Food());

    canScan = signal<boolean>(this.databaseService.isMobilePlatform());

    /**
     * Attempt to scan a barcode, find the food associated with it,
     * and pass it on to the appropriate handler
     */
    async scan() {
        const barcode = await this.scanService.scan();
        this.openSnackBar(`Scanned ${barcode}`, 'Dismiss', 5000);
        if (barcode) {
            //  Search the DB first
            const foods = await this.databaseService.getFoodsByBarcode(barcode);
            if (foods.length >= 1) {
                // We find something in the DB
                this.handleFoodListSelection(foods[0]);
            } else {
                // We don't find the barcode, so we need to add it
                const scanDto = await this.openFoodFactsService.searchByBarcode(barcode);
                this.handleOnlineFoodListSelection(scanDto);
            }
        }
    }

    async search(searchTerm: string): Promise<Array<Food>> {
        return await this.databaseService.getFoodsBySearch(searchTerm);
    }

    async searchOnline(searchTerm: string) {
        this.onlineFoods.set([]);
        this.searching.set(true);
        const foods = await this.openFoodFactsService.searchByText(searchTerm);
        this.onlineFoods.set(foods);
        this.searching.set(false);
    }

    async onMealFoodSubmit(mealFood: MealFood) {
        const result = await this.databaseService.createMealFood(mealFood);
        if (!result) {
            console.error('Unable to add meal food!');
            this.openSnackBar('Meal cannot have duplicate foods');
        }
        this.searchText.setValue('');
        this.foodToAdd.set(new Food());
    }

    /**
     *
     * @param existingData If present, pre-fill form with this data
     * @returns TODO: Food that is created or undefined if nothing is created
     */
    async addFood(existingData?: FoodDTO): Promise<Food | undefined> {
        // Re-search after modifying a food so we show accurate data
        // this.searchText.setValue('');
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
        const newFoodDto: FoodDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newFoodDto !== undefined) {
            const createResult = await this.databaseService.createFood(newFoodDto);
            if (typeof createResult === 'string') {
                console.error('Failed to add food: ' + JSON.stringify(newFoodDto));
                console.error(createResult);
                this.openSnackBar('Failed to add food!');
                return undefined;
            } else {
                return createResult;
            }
        }
        return undefined;
    }

    async modifyFood(food: Food) {
        // Re-search after modifying a food so we show accurate data
        // this.searchText.setValue('');
        const dialogData: FoodDialogData = {
            modify: true,
            food: food,
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
            const success = await this.databaseService.updateFoodByDto(food.id, newFood);
            if (!success) {
                console.error('Failed to update food: ' + JSON.stringify(newFood));
                this.openSnackBar('Failed to edit food!');
            }
        }
    }

    /**
     * Reset the search bar, then either mondify selected food xor
     * activate the mealfood form
     * @param food food chosen from list
     */
    handleFoodListSelection(food: Food) {
        // Re-search after modifying a food so we show accurate data
        this.searchText.setValue('');

        if (this.addingToMeal()) {
            this.foodToAdd.set(food);
        } else {
            this.modifyFood(food);
        }
    }

    /**
     * Reset the search bar, add the food selected, then activate
     * mealfood form if applicable
     * @param food food chosen from list
     */
    async handleOnlineFoodListSelection(food: FoodDTO) {
        // Re-search after modifying a food so we show accurate data
        this.searchText.setValue('');

        const newfood = await this.addFood(food);
        if (newfood !== undefined && this.addingToMeal()) {
            this.foodToAdd.set(newfood);
        }
    }

    /**
     *
     * @param message Notification message
     * @param action Text used for the dismissal button
     * @param duration Duration in ms before notification dismisses itself. Defaults to 15s
     */
    private openSnackBar(message: string, action: string = 'Dismiss', duration = 15000) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }

    constructor() {
        this.dateService.setTitle('Food');
    }

    async ngOnInit(): Promise<void> {
        const mealIdParam: string | undefined = this.route.snapshot.queryParams['meal'];
        if (mealIdParam) {
            this.mealId = Number(mealIdParam);
            this.meal = await this.databaseService.getMealById(this.mealId);
            this.addingToMeal.set(true);
        }
    }
}
