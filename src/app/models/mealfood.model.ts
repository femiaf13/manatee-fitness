export class MealFood {
    meal_id: number;
    food_id: number;
    quantity_grams: number;

    constructor(mealId: number = -1, foodId: number = -1, quantityGrams: number = 0) {
        this.meal_id = mealId;
        this.food_id = foodId;
        this.quantity_grams = quantityGrams;
    }
}
