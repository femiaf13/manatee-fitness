import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecipeCardComponent } from '@components/recipe-card/recipe-card.component';
import { Recipe } from '@models/recipe.model';
import { RecipeWithRecipeFoods } from '@models/recipe.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';

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

    recipes = signal<Array<Recipe>>([]);
    recipesWithRecipeFoods = signal<Array<RecipeWithRecipeFoods>>([]);

    /**
     * Create a dialog to add a new recipe
     * @returns
     */
    addRecipe() {
        return true;
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
