import { Component, effect, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { Meal, MealDTO } from '@models/meal.model';
import { MealCardComponent } from '@components/meal-card/meal-card.component';
import { DateService } from '@services/date.service';
import { MealDialogComponent } from '@components/dialogs/meal/meal-dialog.component';

@Component({
    selector: 'app-page-diary',
    standalone: true,
    imports: [MealCardComponent, MatButtonModule],
    templateUrl: './diary.component.html',
    styleUrl: './diary.component.css',
})
export class DiaryComponent {
    dateService = inject(DateService);
    dialog = inject(MatDialog);

    today = this.dateService.selectedDateFormatted;
    meals: Array<Meal> = [];

    constructor() {
        effect(() => {
            invoke<Array<Meal>>('find_meals_by_date', { dateToFind: this.today() }).then(meals => (this.meals = meals));
        });
    }

    async addMeal() {
        const dialogRef = this.dialog.open(MealDialogComponent, {
            data: {
                animal: 'panda',
            },
        });
        dialogRef.afterClosed().subscribe(async (mealDto: MealDTO) => {
            const success = await invoke<boolean>('create_meal', { meal: mealDto });
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(mealDto));
            }
            this.meals = await invoke<Array<Meal>>('find_meals_by_date', { dateToFind: this.today() });
        });
        // const meals = await invoke<Array<Meal>>('find_meals_by_date', { dateToFind: this.today() });
        // console.log(JSON.stringify(meals));
        // if (meals.length === 0) {
        //     const meal: MealDTO = {
        //         meal_name: 'dinner',
        //         meal_date: this.today(),
        //     };
        //     const success = await invoke<boolean>('create_meal', { meal: meal });
        //     if (success) {
        //         invoke<Array<Meal>>('find_meals_by_date', { dateToFind: this.today() }).then(
        //             meals => (this.meals = meals)
        //         );
        //     } else {
        //         console.error('Failed to insert');
        //     }
        // }
    }
}
