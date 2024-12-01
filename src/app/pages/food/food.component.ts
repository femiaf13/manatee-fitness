import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Food } from '@models/food.model';
import { DatabaseService } from '@services/database.service';
import { FoodListComponent } from '@components/food-list/food-list.component';
import { MealfoodFormComponent } from '@components/forms/mealfood-form/mealfood-form.component';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';

@Component({
    selector: 'app-page-food',
    standalone: true,
    imports: [
        CommonModule,
        MatAutocompleteModule,
        MatDividerModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FoodListComponent,
        MealfoodFormComponent,
    ],
    templateUrl: './food.component.html',
    styleUrl: './food.component.css',
})
export class FoodPageComponent implements OnInit {
    route = inject(ActivatedRoute);
    databaseService = inject(DatabaseService);
    searchText = new FormControl<string | Food>('', { nonNullable: true });
    foods = toSignal(
        this.searchText.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchTerm => this.search(searchTerm))
        ),
        { initialValue: [] as Food[] }
    );
    /**
     * Optional input parameter telling us if we're looking for food for a specific meal
     */
    mealId: number | undefined = undefined;
    meal: Meal | undefined = undefined;

    displayFoods(food: Food): string {
        return food && food.description ? food.description : '';
    }

    async search(searchTerm: string | Food): Promise<Array<Food>> {
        const searchTermParsed = typeof searchTerm === 'string' ? searchTerm : searchTerm?.description;
        return await this.databaseService.getFoodsBySearch(searchTermParsed);
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
