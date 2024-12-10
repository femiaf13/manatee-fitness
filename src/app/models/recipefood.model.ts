export class RecipeFood {
    recipe_id: number;
    food_id: number;
    quantity_grams: number;

    constructor(recipeId: number = -1, foodId: number = -1, quantityGrams: number = 0) {
        this.recipe_id = recipeId;
        this.food_id = foodId;
        this.quantity_grams = quantityGrams;
    }
}
