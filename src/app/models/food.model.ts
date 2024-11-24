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
    // Fiber in g per 100g
    fiber: number;
    // Sodium in mg per 100g
    sodium: number;

    constructor(
        barcode: string = '',
        description: string = '',
        brand: string = '',
        caloriesPer100g: number = 0,
        gramsPerServing: number = 0,
        servingText: string = '',
        fat: number = 0,
        carbs: number = 0,
        protein: number = 0,
        cholesterol: number = 0,
        fiber: number = 0,
        sodium: number = 0
    ) {
        this.barcode = barcode;
        this.description = description;
        this.brand = brand;
        this.calories_per_100g = caloriesPer100g;
        this.grams_per_serving = gramsPerServing;
        this.serving_text = servingText;
        this.fat = fat;
        this.carbs = carbs;
        this.protein = protein;
        this.cholesterol = cholesterol;
        this.fiber = fiber;
        this.sodium = sodium;
    }
}

export class Food extends FoodDTO {
    id!: number;
    calories_per_serving!: number;

    constructor() {
        super();
        this.id = 0;
        this.calories_per_serving = 0;
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
