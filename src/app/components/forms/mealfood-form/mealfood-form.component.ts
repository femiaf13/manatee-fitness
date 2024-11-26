import { Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { Food, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';

@Component({
    selector: 'app-mealfood-form',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatGridListModule, MatInputModule],
    templateUrl: './mealfood-form.component.html',
    styleUrl: './mealfood-form.component.css',
})
export class MealfoodFormComponent {
    inputMeal = input.required<Meal>();
    /**
     * string | food is a quirk of how the autocomplete has to be wrangled
     */
    inputFood = input.required<string | Food>();
    actualFood = computed(() => {
        const food: string | Food = this.inputFood();
        if (typeof food === 'string') {
            return null;
        }
        return food;
    });
    outputMealFood = output<MealFood>();

    /**
     * Input in servings
     */
    servings = new FormControl(0, { nonNullable: true });
    /**
     * Input in grams
     */
    grams = new FormControl(0, { nonNullable: true });
    quantityInServings = toSignal(this.servings.valueChanges, { initialValue: 0 });
    quantityInGrams = computed(() => {
        const food: string | Food = this.inputFood();
        if (typeof food === 'string') {
            return 0;
        }
        return this.quantityInServings() * food.grams_per_serving;
    });
    quantityIn100Grams = computed(() => {
        return this.quantityInGrams() / 100;
    });
    summedMealFood = computed(() => {
        const mealfood = new SummedFood();
        const food = this.actualFood();
        const quantityIn100Grams = this.quantityIn100Grams();
        if (food) {
            mealfood.calories = Math.round(quantityIn100Grams * food.calories_per_100g);
            mealfood.carbs = Math.round(quantityIn100Grams * food.carbs);
            mealfood.fat = Math.round(quantityIn100Grams * food.fat);
            mealfood.protein = Math.round(quantityIn100Grams * food.protein);
            mealfood.cholesterol = Math.round(quantityIn100Grams * food.cholesterol);
            mealfood.fiber = Math.round(quantityIn100Grams * food.fiber);
            mealfood.sodium = Math.round(quantityIn100Grams * food.sodium);
        }

        return mealfood;
    });

    constructor() {}
}
