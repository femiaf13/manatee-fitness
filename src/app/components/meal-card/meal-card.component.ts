import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { invoke } from '@tauri-apps/api/core';

import { Food, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFormComponent } from '../forms/meal-form/meal-form.component';

@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [MatButtonModule, MatCardModule, MatIconModule, MealFormComponent],
    templateUrl: './meal-card.component.html',
    styleUrl: './meal-card.component.css',
})
export class MealCardComponent {
    meal = input.required<Meal>();
    mealName = computed(() => this.meal().meal_name.toUpperCase());
    foods: Array<Food> = [];
    summedMeal: SummedFood = new SummedFood();

    // This signal will automatically re-run anytime the meal signal is changed,
    // calculating our foods and nutrition summation
    mealChangeHandler = computed(() => {
        const meal = this.meal();
        this.getFoods(meal);

        return true;
    });

    constructor() {}

    getFoods(meal: Meal) {
        invoke<Array<Food>>('find_foods_by_meal', { mealId: meal.id }).then(foods => {
            console.log('Help me');
            this.foods = foods;
        });
        invoke<SummedFood>('find_calories_by_date_and_meal', {
            dateToFind: meal.meal_date,
            mealToFind: meal.meal_name,
        }).then(summedFood => {
            this.summedMeal = summedFood;
        });
    }
}
