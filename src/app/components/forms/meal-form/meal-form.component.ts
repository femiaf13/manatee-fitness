import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
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

    private formBuilder = inject(FormBuilder);
    mealForm = this.formBuilder.group({
        mealDate: ['', [Validators.required]],
        mealName: ['', [Validators.required]]
    });

    constructor() {
        if( this.inputMeal() !== undefined) {
            const inputMealDto = this.inputMeal() as MealDTO; 
            this.mealForm.setValue({
                mealDate: inputMealDto.meal_date,
                mealName: inputMealDto.meal_name
            })
        }
    }

    formatDate() {
        if (this.mealForm.value.mealDate) {
            this.mealForm.value.mealDate = formatDate(this.mealForm.value.mealDate, 'yyyy-MM-dd', 'en')
        }
    }

    onSubmit() {
        console.log(this.mealForm.value)
        // make mealDTO from form
        // meal.emit() it
    }
}
