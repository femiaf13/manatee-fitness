import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { FoodDTO } from '@models/food.model';

@Component({
    selector: 'app-food-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
    ],
    templateUrl: './food-form.component.html',
    styleUrl: './food-form.component.css',
})
export class FoodFormComponent {
    inputFood = input<FoodDTO>(new FoodDTO());
    outputFood = output<FoodDTO>();
    cancel = output<boolean>();

    private formBuilder = inject(NonNullableFormBuilder);
    foodForm = this.formBuilder.group({
        barcode: [''],
        description: ['', [Validators.required, Validators.minLength(3)]],
        brand: [''],
        gramsPerServing: [0, Validators.required],
        caloriesPerServing: [0, Validators.required],
        servingText: [''],
        fat: [0],
        carbs: [0],
        protein: [0],
        cholesterol: [0],
        fiber: [0],
        sodium: [0],
    });

    onSubmit() {
        const rawFormValues = this.foodForm.getRawValue();
        const caloriesPer100g = (rawFormValues.caloriesPerServing / rawFormValues.gramsPerServing) * 100;
        const foodDtoOutput: FoodDTO = new FoodDTO(
            rawFormValues.barcode,
            rawFormValues.description,
            rawFormValues.brand,
            +caloriesPer100g.toFixed(2),
            rawFormValues.gramsPerServing,
            rawFormValues.servingText,
            rawFormValues.fat,
            rawFormValues.carbs,
            rawFormValues.protein,
            rawFormValues.cholesterol,
            rawFormValues.fiber,
            rawFormValues.sodium
        );
        this.outputFood.emit(foodDtoOutput);
    }

    onCancel() {
        this.cancel.emit(true);
    }

    constructor() {
        effect(() => {
            const inputFood = this.inputFood();

            untracked(() => {
                const caloriesServing = (inputFood.grams_per_serving / 100) * inputFood.calories_per_100g;
                this.foodForm.controls.barcode.setValue(inputFood.barcode);
                this.foodForm.controls.description.setValue(inputFood.description);
                this.foodForm.controls.brand.setValue(inputFood.brand);
                this.foodForm.controls.caloriesPerServing.setValue(+caloriesServing.toFixed(2));
                this.foodForm.controls.gramsPerServing.setValue(inputFood.grams_per_serving);
                this.foodForm.controls.servingText.setValue(inputFood.serving_text);
                this.foodForm.controls.fat.setValue(inputFood.fat);
                this.foodForm.controls.carbs.setValue(inputFood.carbs);
                this.foodForm.controls.protein.setValue(inputFood.protein);
                this.foodForm.controls.cholesterol.setValue(inputFood.cholesterol);
                this.foodForm.controls.fiber.setValue(inputFood.fiber);
                this.foodForm.controls.sodium.setValue(inputFood.sodium);
            });
        });
    }
}
