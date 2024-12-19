import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MealfoodFormComponent } from '@components/forms/mealfood-form/mealfood-form.component';
import { Meal } from '@models/meal.model';
import { MealFood, SummedMealFood } from '@models/mealfood.model';

export interface MealFoodDialogData {
    meal: Meal;
    summedMealFood: SummedMealFood;
}

@Component({
    selector: 'app-mealfood-dialog',
    imports: [CommonModule, MatDialogModule, MealfoodFormComponent],
    templateUrl: './mealfood-dialog.component.html',
    styleUrl: './mealfood-dialog.component.css',
})
export class MealfoodDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<MealFoodDialogData>(MAT_DIALOG_DATA);

    onSubmit(meal: MealFood) {
        this.dialog.close(meal);
    }

    onCancel() {
        this.dialog.close(undefined);
    }
}
