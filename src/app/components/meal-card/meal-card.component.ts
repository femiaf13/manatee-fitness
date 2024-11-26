import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MealDialogData, MealDialogComponent } from '@components/dialogs/meal/meal-dialog.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { Food, SummedFood } from '@models/food.model';
import { Meal, MealDTO } from '@models/meal.model';
import { DatabaseService } from '@services/database.service';
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
    databaseService = inject(DatabaseService);
    dialog = inject(MatDialog);
    meal = input.required<Meal>();
    mealChanged = output<boolean>();
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

    async onLongPress(event: MouseEvent) {
        event.preventDefault();

        // Pop up the meal dialog and handle its return here
        const dialogData: MealDialogData = {
            modify: true,
            meal: this.meal(),
        };
        const dialogRef = this.dialog.open(MealDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newMeal: MealDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMeal !== undefined) {
            const success = await this.databaseService.updateMealByDto(this.meal().id, newMeal);
            if (!success) {
                console.error('Failed to update meal: ' + JSON.stringify(newMeal));
            }
        }

        this.mealChanged.emit(true);
    }
}
