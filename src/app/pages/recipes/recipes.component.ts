import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Recipe } from '@models/recipe.model';
import { RecipeFood } from '@models/recipefood.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';

interface RecipeWithRecipeFoods {
    recipe: Recipe;
    recipeFoods: Array<RecipeFood>;
}

@Component({
    selector: 'app-page-recipes',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatExpansionModule, MatListModule, MatIconModule],
    templateUrl: './recipes.component.html',
    styleUrl: './recipes.component.css',
})
export class RecipesPageComponent implements OnInit {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);

    recipes = signal<Array<Recipe>>([]);
    recipesWithRecipeFoods = signal<Array<RecipeWithRecipeFoods>>([]);

    constructor() {
        this.dateService.setTitle('Recipes');
        effect(() => {
            const recipes = this.recipes();

            untracked(() => {
                // Okay this needs explaining:
                //
                // Whenever the list of recipes is set we get the recipesfoods
                // for each recipe and jam them all together into a specific object
                // to make easy access for later.
                //
                // A better way to do this later is have Rust do it for us and with fewer DB
                // calls.
                this.recipesWithRecipeFoods.set([]);
                for (const recipe of recipes) {
                    this.databaseService.getRecipeFoodsByRecipe(recipe.id).then(recipeFoods => {
                        this.recipesWithRecipeFoods.update(currentArray => {
                            const recipesWithRecipeFood: RecipeWithRecipeFoods = {
                                recipe: recipe,
                                recipeFoods: recipeFoods,
                            };
                            currentArray.push(recipesWithRecipeFood);
                            return currentArray;
                        });
                    });
                }
            });
        });
    }

    async ngOnInit() {
        const recipes = await this.databaseService.getRecipes();
        this.recipes.set(recipes);
    }
}
