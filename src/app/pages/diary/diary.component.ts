import { Component, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, lastValueFrom, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { Meal, MealDTO } from '@models/meal.model';
import { MealCardComponent } from '@components/meal-card/meal-card.component';
import { DateService } from '@services/date.service';
import { MealDialogComponent, MealDialogData } from '@components/dialogs/meal/meal-dialog.component';
import { DatabaseService } from '@services/database.service';
import { Food } from '@models/food.model';
import { FoodListComponent } from '../../components/food-list/food-list.component';

@Component({
    selector: 'app-page-diary',
    standalone: true,
    imports: [
        CommonModule,
        MealCardComponent,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FoodListComponent,
    ],
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

    searchText = new FormControl('', { nonNullable: true });
    foods = toSignal(
        this.searchText.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchTerm => this.search(searchTerm))
        ),
        { initialValue: [] as Food[] }
    );

    async search(searchTerm: string): Promise<Array<Food>> {
        return await this.databaseService.getFoodsBySearch(searchTerm);
    }

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
        this.meals = await this.databaseService.getMealsByDate(this.today());
    }
}
