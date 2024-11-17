import { Component, computed, effect, input, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { invoke } from '@tauri-apps/api/core';

import { Food, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFormComponent } from '../forms/meal-form/meal-form.component';
import { DateService } from '@services/date.service';

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
    mealTime = computed(() => {
        const time = DateService.formatTime(this.meal().meal_time);
        if (time === '') {
            return 'No Time Listed';
        } else {
            return time;
        }
    });
    foods: Array<Food> = [];
    summedMeal: SummedFood = new SummedFood();

    constructor() {
        // This effect will automatically re-run anytime the meal signal is changed,
        // calculating our foods and nutrition summation
        effect(() => {
            const meal = this.meal();

            untracked(() => {
                invoke<Array<Food>>('find_foods_by_meal', { mealId: meal.id }).then(foods => {
                    this.foods = foods;
                });
                invoke<SummedFood>('find_calories_by_date_and_meal', {
                    dateToFind: meal.meal_date,
                    mealToFind: meal.meal_name,
                }).then(summedFood => {
                    this.summedMeal = summedFood;
                });
            });
        });
    }
}
