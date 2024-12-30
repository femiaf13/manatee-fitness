import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import {
    ConfirmationDialogData,
    ConfirmationDialogComponent,
} from '@components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { RecipeDialogData, RecipeDialogComponent } from '@components/dialogs/recipe-dialog/recipe-dialog.component';
import {
    RecipeFoodDialogData,
    RecipefoodDialogComponent,
} from '@components/dialogs/recipefood/recipefood-dialog.component';
import { SummedFoodChipsComponent } from '@components/summed-food-chips/summed-food-chips.component';
import { LongPressDirective } from '@directives/longpress.directive';
import { SummedFood } from '@models/food.model';
import { RecipeWithRecipeFoods, SummedRecipeFood } from '@models/recipe.model';
import { RecipeFood } from '@models/recipefood.model';
import { DatabaseService } from '@services/database.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-recipe-card',
    imports: [
        CommonModule,
        LongPressDirective,
        MatButtonModule,
        MatExpansionModule,
        MatListModule,
        MatIconModule,
        RouterLink,
        SummedFoodChipsComponent,
    ],
    templateUrl: './recipe-card.component.html',
    styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
    databaseService = inject(DatabaseService);
    dialog = inject(MatDialog);

    recipeWithRecipeFood = input.required<RecipeWithRecipeFoods>();
    recipeChanged = output<void>();

    summedRecipe = computed(() => {
        const summedRecipe = new SummedFood();
        for (const recipeFood of this.recipeWithRecipeFood().recipeFoods) {
            summedRecipe.calories += recipeFood.summed_food.calories;
            summedRecipe.carbs += recipeFood.summed_food.carbs;
            summedRecipe.fat += recipeFood.summed_food.fat;
            summedRecipe.protein += recipeFood.summed_food.protein;
            summedRecipe.cholesterol += recipeFood.summed_food.cholesterol;
            summedRecipe.fiber += recipeFood.summed_food.fiber;
            summedRecipe.sodium += recipeFood.summed_food.sodium;
        }
        return summedRecipe;
    });

    async deleteRecipe(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();

        const dialogData: ConfirmationDialogData = {
            title: `Delete ${this.recipeWithRecipeFood().recipe.recipe_name}?`,
            content: `Are you sure you want to delete this recipe?`,
            action: 'Delete',
        };
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: dialogData,
        });
        const confirmed = await lastValueFrom(dialogRef.afterClosed());
        if (confirmed) {
            const success = await this.databaseService.deleteRecipe(this.recipeWithRecipeFood().recipe.id);
            if (!success) {
                console.error('Failed to delete recipe: ' + JSON.stringify(this.recipeWithRecipeFood()));
            }
            this.recipeChanged.emit();
        }
    }

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

    async onRecipeFoodLongPress(event: Event, food: SummedRecipeFood) {
        event.stopPropagation();
        event.preventDefault();

        const dialogData: ConfirmationDialogData = {
            title: `Delete ${food.food.description}?`,
            content: `Are you sure you want to delete this food from ${this.recipeWithRecipeFood().recipe.recipe_name}?`,
            action: 'Delete',
        };
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: dialogData,
        });
        const confirmed = await lastValueFrom(dialogRef.afterClosed());
        if (confirmed) {
            const success = await this.databaseService.deleteRecipeFood(
                this.recipeWithRecipeFood().recipe.id,
                food.food.id
            );
            if (!success) {
                console.error('Failed to delete recipe food: ' + JSON.stringify(food.food.description));
            }
            this.recipeChanged.emit();
        }
    }

    async openRecipeFoodDialog(food: SummedRecipeFood) {
        const dialogData: RecipeFoodDialogData = {
            recipe: this.recipeWithRecipeFood().recipe,
            summedRecipeFood: food,
        };
        const dialogRef = this.dialog.open(RecipefoodDialogComponent, {
            data: dialogData,
            disableClose: true,
            width: '90vw',
            height: '90vh',
            maxWidth: '90vw',
            maxHeight: '90vh',
        });
        const newRecipeFood: RecipeFood | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newRecipeFood !== undefined) {
            const success = await this.databaseService.updateRecipeFood(newRecipeFood);
            if (!success) {
                console.error('Failed to update recipe food: ' + JSON.stringify(newRecipeFood));
            }
            this.recipeChanged.emit();
        }
    }

    constructor() {}
}
