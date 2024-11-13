import { Component, effect, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { lastValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { Meal, MealDTO } from '@models/meal.model';
import { MealCardComponent } from '@components/meal-card/meal-card.component';
import { DateService } from '@services/date.service';
import { MealDialogComponent, MealDialogData } from '@components/dialogs/meal/meal-dialog.component';

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
        const dialogData: MealDialogData = {
            modify: false,
        };
        const dialogRef = this.dialog.open(MealDialogComponent, {
            data: dialogData,
        });
        const newMeal: MealDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMeal !== undefined) {
            const success = await invoke<boolean>('create_meal', { meal: newMeal });
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(newMeal));
            }
        }
        this.meals = await invoke<Array<Meal>>('find_meals_by_date', { dateToFind: this.today() });
    }
}
