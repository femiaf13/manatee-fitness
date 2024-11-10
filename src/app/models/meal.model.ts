import { format } from "date-fns";

export class Meal {
    id!: Number;
    meal_date!: String;
    meal_name!: String;
}

export class MealDTO {
    meal_date: String;
    meal_name: String;

    constructor() {
        this.meal_date = format(new Date(), "yyyy-MM-dd");
        this.meal_name = '';
    }
}