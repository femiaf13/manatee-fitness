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
 * This is a type predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @param item Food or recipe we're determining the type of
 * @returns true if Recipe otherwise false
 */
export function isRecipe(item: Food | Recipe): item is Recipe {
    return (item as Recipe).recipe_name !== undefined;
}
