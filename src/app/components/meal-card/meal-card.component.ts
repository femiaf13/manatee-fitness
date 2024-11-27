import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FoodDialogComponent, FoodDialogData } from '@components/dialogs/food/food-dialog.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { Food, FoodDTO, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { DateService } from '@services/date.service';
import { invoke } from '@tauri-apps/api/core';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [LongPressDirective, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
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
    dialog = inject(MatDialog);

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

    async addFood() {
        const dialogData: FoodDialogData = {
            modify: false,
        };
        const dialogRef = this.dialog.open(FoodDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            data: dialogData,
            disableClose: true,
        });
        const newMeal: FoodDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMeal !== undefined) {
            // const success = await this.databaseService.createMeal(newMeal);
            // if (!success) {
            //     console.error('Failed to add meal: ' + JSON.stringify(newMeal));
            // }
            console.log(JSON.stringify(newMeal));
        }
        // this.meals = await this.databaseService.getMealsByDate(this.today());
    }

    onLongPress(event: Event) {
        event.preventDefault();
        console.log('I was pressed!');
    }
}
