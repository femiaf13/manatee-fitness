import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MealDialogData, MealDialogComponent } from '@components/dialogs/meal/meal-dialog.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { SwipeDirective } from '@directives/swipe.directive';
import { SummedFood } from '@models/food.model';
import { Meal, MealDTO } from '@models/meal.model';
import { SummedMealFood } from '@models/mealfood.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { invoke } from '@tauri-apps/api/core';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [LongPressDirective, MatButtonModule, MatCardModule, MatIconModule, RouterLink, SwipeDirective],
    templateUrl: './meal-card.component.html',
    styleUrl: './meal-card.component.css',
})
export class MealCardComponent {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
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
    foods: Array<SummedMealFood> = [];
    summedMeal: SummedFood = new SummedFood();

    // TODO: Should grab mealfoods so we have access to quantity, and the ability to
    // modify the mealfood. This will likely come with a re-org of how the mealfoods are displayed

    constructor() {
        // This effect will automatically re-run anytime the meal signal is changed,
        // calculating our foods and nutrition summation
        effect(() => {
            const meal = this.meal();

            untracked(() => {
                this.databaseService.getSummedFoodByMeal(meal.id).then(mealFoods => {
                    this.foods = mealFoods;
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
