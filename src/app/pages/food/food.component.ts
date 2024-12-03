import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Food, FoodDTO } from '@models/food.model';
import { DatabaseService } from '@services/database.service';
import { LocalFoodListComponent, OpenFoodFactsFoodListComponent } from '@components/food-list/food-list.component';
import { MealfoodFormComponent } from '@components/forms/mealfood-form/mealfood-form.component';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';
import { OpenFoodFactsService } from '@services/open-food-facts.service';
import { scan, Format } from '@tauri-apps/plugin-barcode-scanner';

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
    databaseService = inject(DatabaseService);
    openFoodFactsService = inject(OpenFoodFactsService);

    searchText = new FormControl<string | Food>('', { nonNullable: true });
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

    tempScanResult = signal<string>('');

    displayFoods(food: Food): string {
        return food && food.description ? food.description : '';
    }

    async scan() {
        const tempScanResult = await scan({
            windowed: false,
            formats: [Format.EAN13, Format.EAN8, Format.UPC_A, Format.UPC_E],
        });
        this.tempScanResult.set(tempScanResult.content);
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

    constructor() {}

    async ngOnInit(): Promise<void> {
        const mealIdParam: string | undefined = this.route.snapshot.queryParams['meal'];
        if (mealIdParam) {
            this.mealId = Number(mealIdParam);
            this.meal = await this.databaseService.getMealById(this.mealId);
        }
    }
}
