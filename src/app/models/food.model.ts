export class Food {
    id!: Number;
    description!: string;
    calories_per_100g!: Number;
    grams_per_serving!: Number;
    serving_text!: String;
    calories_per_serving!: Number;
    fat!: Number;
    carbs!: Number;
    protein!: Number;
    cholesterol!: Number;
    fiber!: Number;
}

export class FoodDTO {
    description: string;
    calories_per_100g: Number;
    grams_per_serving: Number;
    serving_text: String;
    fat: Number;
    carbs: Number;
    protein: Number;
    cholesterol: Number;
    fiber: Number;

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
    calories: Number;
    fat: Number;
    carbs: Number;
    protein: Number;
    cholesterol: Number;
    fiber: Number;

    constructor() {
        this.calories = 0;
        this.fat = 0;
        this.carbs = 0;
        this.protein = 0;
        this.cholesterol = 0;
        this.fiber = 0;
    }
}