import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipeDialogData, RecipeDialogComponent } from '@components/dialogs/recipe-dialog/recipe-dialog.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { RecipeWithRecipeFoods } from '@models/recipe.model';
import { DatabaseService } from '@services/database.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-recipe-card',
    standalone: true,
    imports: [CommonModule, LongPressDirective, MatButtonModule, MatExpansionModule, MatListModule, MatIconModule],
    templateUrl: './recipe-card.component.html',
    styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
    databaseService = inject(DatabaseService);
    dialog = inject(MatDialog);

    recipeWithRecipeFood = input.required<RecipeWithRecipeFoods>();
    recipeChanged = output<void>();

    totalCalories = computed(() => {
        let total = 0;
        for (const recipeFood of this.recipeWithRecipeFood().recipeFoods) {
            total += recipeFood.summed_food.calories;
        }
        return total;
    });

    async onLongPressRecipeCard(event: MouseEvent) {
        event.preventDefault();

        // Pop up the recipe dialog and handle its return here
        const dialogData: RecipeDialogData = {
            modify: true,
            recipe: this.recipeWithRecipeFood().recipe,
        };
        const dialogRef = this.dialog.open(RecipeDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newRecipe: string | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newRecipe !== undefined) {
            const success = await this.databaseService.updateRecipe(this.recipeWithRecipeFood().recipe.id, newRecipe);
            if (!success) {
                console.error('Failed to update recipe: ' + JSON.stringify(newRecipe));
            }
            this.recipeChanged.emit();
        }
    }

    constructor() {}
}
