import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
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
    inputMeal = input<FoodDTO>(new FoodDTO());
    outputFood = output<FoodDTO>();
    cancel = output<boolean>();

    private formBuilder = inject(NonNullableFormBuilder);
    foodForm = this.formBuilder.group({
        barcode: [''],
        description: ['', [Validators.required, Validators.minLength(3)]],
        brand: [''],
        caloriesPer100g: [0, Validators.required],
        gramsPerServing: [0, Validators.required],
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
        const foodDtoOutput: FoodDTO = new FoodDTO(
            rawFormValues.barcode,
            rawFormValues.description,
            rawFormValues.brand,
            rawFormValues.caloriesPer100g,
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
}
