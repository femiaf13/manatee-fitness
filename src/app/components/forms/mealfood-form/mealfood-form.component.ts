import { Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Food } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { MealFood } from '@models/mealfood.model';

@Component({
    selector: 'app-mealfood-form',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    templateUrl: './mealfood-form.component.html',
    styleUrl: './mealfood-form.component.css',
})
export class MealfoodFormComponent {
    inputMeal = input.required<Meal>();
    /**
     * string | food is a quirk of how the autocomplete has to be wrangled
     */
    inputFood = input.required<string | Food>();
    outputMealFood = output<MealFood>();

    servings = new FormControl(0, { nonNullable: true });
    quantityInServings = toSignal(this.servings.valueChanges, { initialValue: 0 });
    quantityInGrams = computed(() => {
        const food: string | Food = this.inputFood();
        if (typeof food === 'string') {
            return 0;
        }
        return this.quantityInServings() * food.calories_per_serving;
    });
    caloriesForMealFood = computed(() => {
        const food: string | Food = this.inputFood();
        if (typeof food === 'string') {
            return -1;
        }

        return this.quantityInServings() * food.calories_per_serving;
    });

    constructor() {}
}
