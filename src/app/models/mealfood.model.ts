import { Food, SummedFood } from './food.model';

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

export class SummedMealFood {
    quantity_grams: number;
    quantity_servings: number;
    food: Food;
    summedFood: SummedFood;

    constructor() {
        this.quantity_grams = 0;
        this.quantity_servings = 0;
        this.food = new Food();
        this.summedFood = new SummedFood();
    }
}
