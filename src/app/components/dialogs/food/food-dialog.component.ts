import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FoodFormComponent } from '@components/forms/food-form/food-form.component';
import { FoodDTO } from '@models/food.model';

export interface FoodDialogData {
    modify: boolean;
    food?: FoodDTO;
}

@Component({
    selector: 'app-food-dialog',
    imports: [MatDialogTitle, MatDialogContent, FoodFormComponent],
    templateUrl: './food-dialog.component.html',
    styleUrl: './food-dialog.component.css',
})
export class FoodDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<FoodDialogData>(MAT_DIALOG_DATA);

    onSubmit(food: FoodDTO) {
        this.dialog.close(food);
    }

    onCancel() {
        this.dialog.close(undefined);
    }
}
