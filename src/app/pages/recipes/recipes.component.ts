import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RecipeDialogData, RecipeDialogComponent } from '@components/dialogs/recipe-dialog/recipe-dialog.component';
import { RecipeCardComponent } from '@components/recipe-card/recipe-card.component';
import { Recipe } from '@models/recipe.model';
import { RecipeWithRecipeFoods } from '@models/recipe.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { debounceTime, distinctUntilChanged, lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-page-recipes',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        RecipeCardComponent,
    ],
    templateUrl: './recipes.component.html',
    styleUrl: './recipes.component.css',
})
export class RecipesPageComponent implements OnInit {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    dialog = inject(MatDialog);

    recipes = signal<Array<Recipe>>([]);
    recipesWithRecipeFoods = signal<Array<RecipeWithRecipeFoods>>([]);

    /** Form control for recipe filtering */
    searchText = new FormControl<string>('', { nonNullable: true });

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
     * Grab all(or filtered) recipes from the DB and set the signal with the value
     *
     * We are filtering in JS instead of SQL here because the number of recipes should never be
     * as large as the number of foods. It feels like overkill to take things down to SQL
     * for something like this. It can be changed later if the performance ends up being a problem.
     *
     * @param [filter=undefined] Filter to apply to recipes that will be shown. **Default is no filter**
     */
    async refreshRecipes(filter: string | undefined = undefined) {
        let recipes = await this.databaseService.getRecipes();
        if (filter !== undefined) {
            const trimmedFilter = filter.toLowerCase().trim();
            recipes = recipes.filter(function (recipe) {
                const trimmedName = recipe.recipe_name.toLowerCase().trim();
                return trimmedName.includes(trimmedFilter);
            });
        }
        // NICE TO HAVE: Optimization for later is only setting this if
        // the new list of recipes is actually different from the current set.
        // That way we don't hit the DB at all if nothing will change.
        this.recipes.set(recipes);
    }

    constructor() {
        this.dateService.setTitle('Recipes');

        this.searchText.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe(searchTerm => {
            this.refreshRecipes(searchTerm);
        });

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
