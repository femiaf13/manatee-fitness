import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MealDTO } from '@models/meal.model';

@Component({
    selector: 'app-meal-form',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
    ],
    templateUrl: './meal-form.component.html',
    styleUrl: './meal-form.component.css',
})
export class MealFormComponent {
    inputMeal = input<MealDTO>(new MealDTO());
    outputMeal = output<MealDTO>();
    cancel = output<boolean>();

    private formBuilder = inject(NonNullableFormBuilder);
    mealForm = this.formBuilder.group({
        mealDate: [new Date(), [Validators.required]],
        mealTime: [''],
        mealName: ['', [Validators.required]],
    });

    constructor() {
        effect(() => {
            const inputMealDto = this.inputMeal();
            this.mealForm.setValue({
                // I HATE that this fixes the off by 1 day problem, peak JS
                mealDate: new Date(inputMealDto.meal_date.replaceAll('-', '/')),
                mealTime: inputMealDto.meal_time,
                mealName: inputMealDto.meal_name,
            });
        });
    }

    onSubmit() {
        const rawFormValues = this.mealForm.getRawValue();
        const mealDtoOutput: MealDTO = new MealDTO(
            rawFormValues.mealDate,
            rawFormValues.mealTime,
            rawFormValues.mealName
        );
        this.outputMeal.emit(mealDtoOutput);
    }

    onCancel() {
        this.cancel.emit(true);
    }
}
