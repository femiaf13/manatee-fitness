import { CommonModule } from '@angular/common';
import { Component, effect, inject, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MealDialogComponent, MealDialogData } from '@components/dialogs/meal/meal-dialog.component';
import { MealCardComponent } from '@components/meal-card/meal-card.component';
import { SwipeDirective } from '@directives/swipe.directive';
import { Meal, MealDTO } from '@models/meal.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-page-diary',
    standalone: true,
    imports: [CommonModule, MealCardComponent, MatButtonModule, SwipeDirective],
    templateUrl: './diary.component.html',
    styleUrl: './diary.component.css',
})
export class DiaryComponent {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    dialog = inject(MatDialog);

    today = this.dateService.selectedDateFormatted;
    meals: Array<Meal> = [];
    totalCalories = 0;

    constructor() {
        effect(() => {
            const todayFormatted = this.today();

            untracked(() => {
                this.databaseService.getMealsByDate(todayFormatted).then(meals => (this.meals = meals));
                this.databaseService
                    .getSummedFoodForDate(todayFormatted)
                    .then(summedFood => (this.totalCalories = summedFood.calories));
            });
        });
    }

    async addMeal() {
        const dialogData: MealDialogData = {
            modify: false,
        };
        const dialogRef = this.dialog.open(MealDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newMeal: MealDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMeal !== undefined) {
            const success = await this.databaseService.createMeal(newMeal);
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(newMeal));
            }
        }
        // this.meals = await this.databaseService.getMealsByDate(this.today());
        this.refreshMeals();
    }

    async refreshMeals() {
        this.meals = await this.databaseService.getMealsByDate(this.today());
        this.totalCalories = (await this.databaseService.getSummedFoodForDate(this.today())).calories;
    }
}
