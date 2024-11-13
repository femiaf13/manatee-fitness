import { inject } from '@angular/core';
import { DateService } from '@services/date.service';
import { format } from 'date-fns';

export class MealDTO {
    meal_date: string;
    meal_name: string;

    constructor(date: Date | null = null, name: string = 'New Meal') {
        if (date === null) {
            const dateService = inject(DateService);
            date = dateService.selectedDate();
        }
        this.meal_date = format(date, DateService.DATE_FORMAT_STRING);
        this.meal_name = name;
    }
}

export class Meal extends MealDTO {
    id!: number;
}
