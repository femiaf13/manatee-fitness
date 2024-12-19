import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { Food, SummedFood } from '@models/food.model';
import { Recipe } from '@models/recipe.model';
import { RecipeFood } from '@models/recipefood.model';

@Component({
    selector: 'app-recipefood-form',
    imports: [MatButtonModule, MatFormFieldModule, MatGridListModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './recipefood-form.component.html',
    styleUrl: './recipefood-form.component.css',
})
export class RecipefoodFormComponent {
    inputRecipe = input.required<Recipe>();
    inputFood = input.required<Food>();
    initialQuantityGrams = input<number>(0);
    initialQuantityServings = input<number>(0.0);

    outputRecipeFood = output<RecipeFood>();
    cancelSubmission = output<void>();

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
        const food: Food = this.inputFood();
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
        const food = this.inputFood();
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
            this.servings.setValue(+this.initialQuantityServings().toFixed(3));
            this.grams.setValue(this.initialQuantityGrams());
        });
    }

    async onSubmit() {
        const mealFood = new RecipeFood(this.inputRecipe().id, this.inputFood().id, this.quantityInGrams());
        this.outputRecipeFood.emit(mealFood);
        this.resetInputs();
    }

    resetInputs() {
        // When the input food changes reset both form fields to 0
        this.grams.setValue(0);
        this.servings.setValue(0);
    }
}
