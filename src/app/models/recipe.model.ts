import { Food } from './food.model';

export class Recipe {
    id: number;
    recipe_name: string;

    constructor(recipe_name: string = '') {
        this.id = 0;
        this.recipe_name = recipe_name;
    }
}

// TODO: Need equivalent of SummedMealFood

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
