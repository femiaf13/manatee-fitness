import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, NonNullableFormBuilder, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { MealDTO } from '@models/meal.model';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-meal-form',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [CommonModule, ReactiveFormsModule, 
        MatButtonModule, MatFormFieldModule,
        MatInputModule, MatDatepickerModule],
    templateUrl: './meal-form.component.html',
    styleUrl: './meal-form.component.css'
})
export class MealFormComponent {
    inputMeal = input<MealDTO>(new MealDTO());
    outputMeal = output<MealDTO>();

    private formBuilder = inject(NonNullableFormBuilder);
    mealForm = this.formBuilder.group({
        mealDate: [new Date(), [Validators.required]],
        mealName: ['', [Validators.required]]
    });

    constructor() {
        effect( () => {
            const inputMealDto = this.inputMeal(); 
            this.mealForm.setValue({
                // I HATE that this fixes the off by 1 day problem, peak JS
                mealDate: new Date(inputMealDto.meal_date.replaceAll('-', '/')),
                mealName: inputMealDto.meal_name
            })
        });
    }

    onSubmit() {
        console.log(this.mealForm.value)
        const rawFormValues = this.mealForm.getRawValue();
        const mealDtoOutput: MealDTO = {
            meal_date: formatDate(rawFormValues.mealDate, 'yyyy-MM-dd', 'en'),
            meal_name: rawFormValues.mealName
        };
        this.outputMeal.emit(mealDtoOutput);
    }
}
