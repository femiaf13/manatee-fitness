import { format } from "date-fns";

export class MealDTO {
    meal_date: string;
    meal_name: string;

    constructor() {
        this.meal_date = format(new Date(), "yyyy-MM-dd");
        this.meal_name = 'New Meal';
    }
}

export class Meal extends MealDTO {
    id!: Number;
}