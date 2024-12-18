import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RecipeDialogData, RecipeDialogComponent } from '@components/dialogs/recipe-dialog/recipe-dialog.component';
import { RecipeCardComponent } from '@components/recipe-card/recipe-card.component';
import { Recipe } from '@models/recipe.model';
import { RecipeWithRecipeFoods } from '@models/recipe.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-page-recipes',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, RecipeCardComponent],
    templateUrl: './recipes.component.html',
    styleUrl: './recipes.component.css',
})
export class RecipesPageComponent implements OnInit {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    dialog = inject(MatDialog);

    recipes = signal<Array<Recipe>>([]);
    recipesWithRecipeFoods = signal<Array<RecipeWithRecipeFoods>>([]);

    /**
     * Create a dialog to add a new recipe
     * @returns
     */
    async addRecipe() {
        const dialogData: RecipeDialogData = {
            modify: false,
        };
        const dialogRef = this.dialog.open(RecipeDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newRecipe: string | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newRecipe !== undefined) {
            const success = await this.databaseService.createRecipe(newRecipe);
            if (!success) {
                console.error('Failed to add recipe: ' + JSON.stringify(newRecipe));
            }
        }
        this.refreshRecipes();
    }

    /**
     * Grab all recipes from the DB and set the signal with the value
     */
    async refreshRecipes() {
        const recipes = await this.databaseService.getRecipes();
        this.recipes.set(recipes);
    }

    constructor() {
        this.dateService.setTitle('Recipes');
        effect(() => {
            const recipes = this.recipes();

            untracked(() => {
                // Okay this needs explaining:
                //
                // Whenever the list of recipes is set we get the summed recipefoods
                // for each recipe and jam them all together into a specific object
                // to make easy access for later.
                //
                // A better way to do this later is have Rust do it for us and with fewer DB
                // calls.
                this.recipesWithRecipeFoods.set([]);
                for (const recipe of recipes) {
                    this.databaseService.getSummedFoodByRecipe(recipe.id).then(summedFoods => {
                        this.recipesWithRecipeFoods.update(currentArray => {
                            const recipesWithRecipeFood: RecipeWithRecipeFoods = {
                                recipe: recipe,
                                recipeFoods: summedFoods,
                            };
                            currentArray.push(recipesWithRecipeFood);
                            return currentArray;
                        });
                    });
                }
            });
        });
    }

    ngOnInit() {
        this.refreshRecipes();
    }
}