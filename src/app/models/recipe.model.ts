import { Food, SummedFood } from './food.model';

export class Recipe {
    id: number;
    recipe_name: string;

    constructor(recipe_name: string = '') {
        this.id = 0;
        this.recipe_name = recipe_name;
    }
}

export class SummedRecipeFood {
    quantity_grams: number;
    quantity_servings: number;
    food: Food;
    summed_food: SummedFood;

    constructor() {
        this.quantity_grams = 0;
        this.quantity_servings = 0;
        this.food = new Food();
        this.summed_food = new SummedFood();
    }
}

export interface RecipeWithRecipeFoods {
    recipe: Recipe;
    recipeFoods: Array<SummedRecipeFood>;
}

/**
 * Apply a "contains" filter to an array of recipes by their name.
 *
 * NOTE: The filter will be processed with `filter.toLowerCase().trim()` inside the function
 *
 * EXPLANATION: We are filtering in JS instead of SQL here because the number of recipes should never be
 * as large as the number of foods. It feels like overkill to take things down to SQL
 * for something like this. It can be changed later if the performance ends up being a problem.
 *
 * @param recipes array of recipes to be filtered
 * @param filter filter to apply to array
 * @returns array of recipes that have a name containing the filter
 */
export function filterRecipes(recipes: Recipe[], filter: string): Recipe[] {
    const trimmedFilter = filter.toLowerCase().trim();
    const filteredRecipes = recipes.filter(function (recipe) {
        const trimmedName = recipe.recipe_name.toLowerCase().trim();
        return trimmedName.includes(trimmedFilter);
    });
    return filteredRecipes;
}

/**
 * This is a type predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @param item Food or recipe we're determining the type of
 * @returns true if Recipe otherwise false
 */
export function isRecipe(item: Food | Recipe): item is Recipe {
    return (item as Recipe).recipe_name !== undefined;
}
