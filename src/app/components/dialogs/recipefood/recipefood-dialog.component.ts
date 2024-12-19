import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RecipefoodFormComponent } from '@components/forms/recipefood-form/recipefood-form.component';
import { Recipe, SummedRecipeFood } from '@models/recipe.model';
import { RecipeFood } from '@models/recipefood.model';

export interface RecipeFoodDialogData {
    recipe: Recipe;
    summedRecipeFood: SummedRecipeFood;
}

@Component({
    selector: 'app-recipefood-dialog',
    imports: [MatDialogModule, RecipefoodFormComponent],
    templateUrl: './recipefood-dialog.component.html',
    styleUrl: './recipefood-dialog.component.css',
})
export class RecipefoodDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<RecipeFoodDialogData>(MAT_DIALOG_DATA);

    onSubmit(meal: RecipeFood) {
        this.dialog.close(meal);
    }

    onCancel() {
        this.dialog.close(undefined);
    }
}
