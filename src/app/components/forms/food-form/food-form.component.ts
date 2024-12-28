import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FoodDTO } from '@models/food.model';
import { UnitConversionService } from '@services/unit-conversion.service';

@Component({
    selector: 'app-food-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatMenuModule,
    ],
    templateUrl: './food-form.component.html',
    styleUrl: './food-form.component.css',
})
export class FoodFormComponent {
    unitConversionService = inject(UnitConversionService);

    inputFood = input<FoodDTO>(new FoodDTO());
    outputFood = output<FoodDTO>();
    cancel = output<boolean>();

    private formBuilder = inject(NonNullableFormBuilder);
    foodForm = this.formBuilder.group({
        barcode: [''],
        description: ['', [Validators.required, Validators.minLength(3)]],
        brand: [''],
        gramsPerServing: [0, [Validators.required, Validators.min(0)]],
        caloriesPerServing: [0, [Validators.required, Validators.min(0)]],
        servingText: [''],
        fatPerServing: [0, Validators.min(0)],
        carbsPerServing: [0, Validators.min(0)],
        proteinPerServing: [0, Validators.min(0)],
        cholesterolPerServing: [0, Validators.min(0)],
        fiberPerServing: [0, Validators.min(0)],
        sodiumPerServing: [0, Validators.min(0)],
    });

    servingUnit = signal<string>('g');

    selectUnit(unit: string) {
        const convertedGramsPerServing = this.unitConversionService
            .convert(this.foodForm.controls.gramsPerServing.value)
            .from(this.servingUnit())
            .to(unit);
        this.servingUnit.set(unit);
        this.foodForm.controls.gramsPerServing.setValue(convertedGramsPerServing);
    }

    onSubmit() {
        const rawFormValues = this.foodForm.getRawValue();

        const gramsPerServing = this.unitConversionService
            .convert(rawFormValues.gramsPerServing)
            .from(this.servingUnit())
            .to('g');
        // Convert the per servings numbers back to per 100g for the DB
        const caloriesPer100g = (rawFormValues.caloriesPerServing / gramsPerServing) * 100;
        const fatPer100g = (rawFormValues.fatPerServing / gramsPerServing) * 100;
        const carbsPer100g = (rawFormValues.carbsPerServing / gramsPerServing) * 100;
        const proteinPer100g = (rawFormValues.proteinPerServing / gramsPerServing) * 100;
        const cholesterolPer100g = (rawFormValues.cholesterolPerServing / gramsPerServing) * 100;
        const fiberPer100g = (rawFormValues.fiberPerServing / gramsPerServing) * 100;
        const sodiumPer100g = (rawFormValues.sodiumPerServing / gramsPerServing) * 100;

        const foodDtoOutput: FoodDTO = new FoodDTO(
            rawFormValues.barcode,
            rawFormValues.description,
            rawFormValues.brand,
            +caloriesPer100g.toFixed(1),
            +gramsPerServing.toFixed(1),
            rawFormValues.servingText,
            +fatPer100g.toFixed(1),
            +carbsPer100g.toFixed(1),
            +proteinPer100g.toFixed(1),
            +cholesterolPer100g.toFixed(1),
            +fiberPer100g.toFixed(1),
            +sodiumPer100g.toFixed(1)
        );
        this.outputFood.emit(foodDtoOutput);
    }

    onCancel() {
        this.cancel.emit(true);
    }

    constructor() {
        effect(() => {
            const inputFood = this.inputFood();

            // Show the nutrients as per serving numbers not as the per 100g numbers from the db
            untracked(() => {
                this.foodForm.controls.barcode.setValue(inputFood.barcode);
                this.foodForm.controls.description.setValue(inputFood.description);
                this.foodForm.controls.brand.setValue(inputFood.brand);

                // Handle foods with 0 grams per serving. Auto set serving to 100grams
                const gramsPerServing = inputFood.grams_per_serving > 0 ? inputFood.grams_per_serving : 100;
                // Serving size in 100g, so 133 would be 1.33
                const servingMultiplier = gramsPerServing / 100;
                const caloriesServing = servingMultiplier * inputFood.calories_per_100g;
                this.foodForm.controls.caloriesPerServing.setValue(+caloriesServing.toFixed(1));
                this.foodForm.controls.gramsPerServing.setValue(gramsPerServing);
                this.foodForm.controls.servingText.setValue(inputFood.serving_text);

                const fatServing = servingMultiplier * inputFood.fat;
                this.foodForm.controls.fatPerServing.setValue(+fatServing.toFixed(1));

                const carbsServing = servingMultiplier * inputFood.carbs;
                this.foodForm.controls.carbsPerServing.setValue(+carbsServing.toFixed(1));

                const proteinServing = servingMultiplier * inputFood.protein;
                this.foodForm.controls.proteinPerServing.setValue(+proteinServing.toFixed(1));

                const cholesterolServing = servingMultiplier * inputFood.cholesterol;
                this.foodForm.controls.cholesterolPerServing.setValue(+cholesterolServing.toFixed(1));

                const fiberServing = servingMultiplier * inputFood.fiber;
                this.foodForm.controls.fiberPerServing.setValue(+fiberServing.toFixed(1));

                const sodiumServing = servingMultiplier * inputFood.sodium;
                this.foodForm.controls.sodiumPerServing.setValue(+sodiumServing.toFixed(1));
            });
        });
    }
}
