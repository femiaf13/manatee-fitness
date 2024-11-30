import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Food, SummedFood } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';

@Component({
    selector: 'app-mealfood-form',
    standalone: true,
    imports: [MatButtonModule, MatFormFieldModule, MatGridListModule, MatInputModule, ReactiveFormsModule, RouterLink],
    templateUrl: './mealfood-form.component.html',
    styleUrl: './mealfood-form.component.css',
})
export class MealfoodFormComponent {
    inputMeal = input.required<Meal>();
    /**
     * string | food is a quirk of how the autocomplete has to be wrangled
     */
    inputFood = input.required<string | Food>();
    initialQuantityGrams = input<number>(0);
    initialQuantityServings = input<number>(0.0);

    actualFood = computed(() => {
        const food: string | Food = this.inputFood();
        // !side effect!
        this.resetInputs();
        // !End side effect!
        if (typeof food === 'string') {
            return null;
        }
        return food;
    });
    outputMealFood = output<MealFood>();
    cancel = output<boolean>();

    /**
     * Input in servings
     */
    servings = new FormControl(this.initialQuantityServings(), { nonNullable: true });
    quantityInServings = toSignal(this.servings.valueChanges, { initialValue: this.servings.value });
    /**
     * Input in grams
     */
    grams = new FormControl(this.initialQuantityGrams(), { nonNullable: true });
    gramsSignal = toSignal(this.grams.valueChanges, { initialValue: this.grams.value });

    quantityInGrams = computed(() => {
        const food: string | Food = this.inputFood();
        if (typeof food === 'string') {
            return 0;
        }
        if (food.grams_per_serving > 0) {
            return this.quantityInServings() * food.grams_per_serving;
        } else {
            return this.gramsSignal();
        }
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

    constructor() {
        effect(() => {
            this.servings.setValue(this.initialQuantityServings());
            this.grams.setValue(this.initialQuantityGrams());
        });
    }

    async onSubmit() {
        const mealFood = new MealFood(this.inputMeal().id, this.actualFood()?.id, this.quantityInGrams());
        this.outputMealFood.emit(mealFood);
        this.resetInputs();
    }

    resetInputs() {
        // When the input food changes reset both form fields to 0
        this.grams.setValue(0);
        this.servings.setValue(0);
    }
}
