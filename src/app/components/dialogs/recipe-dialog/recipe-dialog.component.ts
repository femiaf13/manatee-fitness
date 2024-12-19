import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RecipeFormComponent } from '@components/forms/recipe-form/recipe-form.component';
import { Recipe } from '@models/recipe.model';

export interface RecipeDialogData {
    modify: boolean;
    recipe?: Recipe;
}

@Component({
    selector: 'app-recipe-dialog',
    imports: [MatDialogTitle, MatDialogContent, RecipeFormComponent],
    templateUrl: './recipe-dialog.component.html',
    styleUrl: './recipe-dialog.component.css',
})
export class RecipeDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<RecipeDialogData>(MAT_DIALOG_DATA);

    onSubmit(recipeName: string) {
        this.dialog.close(recipeName);
    }

    onCancel() {
        this.dialog.close(undefined);
    }
}
