import { Component, effect, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { invoke } from '@tauri-apps/api/core';

import { Food, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFormComponent } from "../forms/meal-form/meal-form.component";


@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [MatButtonModule, MatCardModule, MatIconModule, MealFormComponent],
    templateUrl: './meal-card.component.html',
    styleUrl: './meal-card.component.css'
})
export class MealCardComponent {
    meal = input.required<Meal>();
    foods: Array<Food> = [];
    summedMeal: SummedFood = new SummedFood();

    constructor() {
        // This effect will automatically re-run anytime the meal signal is changed,
        // calculating our foods and nutrition summation
        effect(() => {
            invoke<Array<Food>>("find_foods_by_meal", { mealId: this.meal().id }).then( (foods) => {
                this.foods = foods
            });
            invoke<SummedFood>("find_calories_by_date_and_meal", { dateToFind: this.meal().meal_date, mealToFind: this.meal().meal_name }).then( (summedFood) => {
                this.summedMeal = summedFood;
            });
        });

    }
}
