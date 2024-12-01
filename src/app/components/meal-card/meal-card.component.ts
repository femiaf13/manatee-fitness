import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '@components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MealDialogData, MealDialogComponent } from '@components/dialogs/meal/meal-dialog.component';
import { MealfoodDialogComponent, MealFoodDialogData } from '@components/dialogs/mealfood/mealfood-dialog.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { SwipeDirective } from '@directives/swipe.directive';
import { SummedFood } from '@models/food.model';
import { Meal, MealDTO } from '@models/meal.model';
import { MealFood, SummedMealFood } from '@models/mealfood.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { invoke } from '@tauri-apps/api/core';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [
        LongPressDirective,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatListModule,
        RouterLink,
        SwipeDirective,
    ],
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

    async onLongPressMealCard(event: MouseEvent) {
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

    async openMealFoodDialog(event: Event, food: SummedMealFood) {
        // event.preventDefault();

        const dialogData: MealFoodDialogData = {
            meal: this.meal(),
            summedMealFood: food,
        };
        const dialogRef = this.dialog.open(MealfoodDialogComponent, {
            data: dialogData,
            disableClose: true,
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
        });
        const newMealFood: MealFood | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMealFood !== undefined) {
            const success = await this.databaseService.updateMealFood(newMealFood);
            if (!success) {
                console.error('Failed to update meal food: ' + JSON.stringify(newMealFood));
            }
        }
        this.mealChanged.emit(true);
    }

    async onMealFoodLongPress(event: Event, food: SummedMealFood) {
        event.stopPropagation();
        event.preventDefault();

        const dialogData: ConfirmationDialogData = {
            title: `Delete ${food.food.description}?`,
            content: `Are you sure you want to delete this food from ${this.meal().meal_name}?`,
            action: 'Delete',
        };
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: dialogData,
        });
        const confirmed = await lastValueFrom(dialogRef.afterClosed());
        if (confirmed) {
            const success = await this.databaseService.deleteMealFood(this.meal().id, food.food.id);
            if (!success) {
                console.error('Failed to delete meal food: ' + JSON.stringify(food.food.description));
            }
        }
        this.mealChanged.emit(true);
    }
}
