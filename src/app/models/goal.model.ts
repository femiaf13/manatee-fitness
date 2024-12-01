export class Goal {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    cholesterol: number;
    fiber: number;
    sodium: number;

    constructor(
        calories: number = 0,
        fat: number = 0,
        carbs: number = 0,
        protein: number = 0,
        cholesterol: number = 0,
        fiber: number = 0,
        sodium: number = 0
    ) {
        this.calories = calories;
        this.fat = fat;
        this.carbs = carbs;
        this.protein = protein;
        this.cholesterol = cholesterol;
        this.fiber = fiber;
        this.sodium = sodium;
    }
}
