export class Food {
    id!: number;
    description!: string;
    calories_per_100g!: number;
    grams_per_serving!: number;
    serving_text!: string;
    calories_per_serving!: number;
    fat!: number;
    carbs!: number;
    protein!: number;
    cholesterol!: number;
    fiber!: number;
}

export class FoodDTO {
    description: string;
    calories_per_100g: number;
    grams_per_serving: number;
    serving_text: string;
    fat: number;
    carbs: number;
    protein: number;
    cholesterol: number;
    fiber: number;

    constructor() {
        this.description = '';
        this.calories_per_100g = 0;
        this.grams_per_serving = 0;
        this.serving_text = '';
        this.fat = 0;
        this.carbs = 0;
        this.protein = 0;
        this.cholesterol = 0;
        this.fiber = 0;
    }
}

export class SummedFood {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    cholesterol: number;
    fiber: number;

    constructor() {
        this.calories = 0;
        this.fat = 0;
        this.carbs = 0;
        this.protein = 0;
        this.cholesterol = 0;
        this.fiber = 0;
    }
}
