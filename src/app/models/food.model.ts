export class FoodDTO {
    barcode: string;
    description: string;
    brand: string;
    calories_per_100g: number;
    grams_per_serving: number;
    serving_text: string;
    // Fat in g per 100g
    fat: number;
    // Carbs in g per 100g
    carbs: number;
    // Protein in g per 100g
    protein: number;
    // Cholesterol in mg per 100g
    cholesterol: number;
    // Fiber in _ per 100g
    fiber: number;
    // Sodium in mg per 100g
    sodium: number;

    constructor() {
        this.barcode = '';
        this.description = '';
        this.brand = '';
        this.calories_per_100g = 0;
        this.grams_per_serving = 0;
        this.serving_text = '';
        this.fat = 0;
        this.carbs = 0;
        this.protein = 0;
        this.cholesterol = 0;
        this.fiber = 0;
        this.sodium = 0;
    }
}

export class Food extends FoodDTO {
    id!: number;
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
