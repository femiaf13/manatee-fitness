import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MealFormComponent } from '@components/forms/meal-form/meal-form.component';
import { MealDTO } from '@models/meal.model';

export interface MealDialogData {
    modify: boolean;
    meal?: MealDTO;
}

@Component({
    selector: 'app-meal-dialog',
    imports: [MatDialogTitle, MatDialogContent, MealFormComponent],
    templateUrl: './meal-dialog.component.html',
    styleUrl: './meal-dialog.component.css',
})
export class MealDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<MealDialogData>(MAT_DIALOG_DATA);

    onSubmit(meal: MealDTO) {
        this.dialog.close(meal);
    }

    onCancel() {
        this.dialog.close(undefined);
    }
}
