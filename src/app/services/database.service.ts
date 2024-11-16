import { Injectable } from '@angular/core';
import { SummedFood } from '@models/food.model';
import { Meal, MealDTO } from '@models/meal.model';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    /**
     *
     * @param meal meal to create
     * @returns true on success, false on error
     */
    public async createMeal(meal: MealDTO): Promise<boolean> {
        return await invoke<boolean>('create_meal', { meal: meal });
    }

    /**
     *
     * @param date date formatted as YYYY-MM-DD
     * @returns all meals for the passed in date
     */
    public async getMealsByDate(date: string): Promise<Array<Meal>> {
        return await invoke<Array<Meal>>('find_meals_by_date', { dateToFind: date });
    }

    /**
     *
     * @param date date formatted as YYYY-MM-DD
     * @returns summed nutritional info for the passed in date
     */
    public async getSummedFoodForDate(date: string): Promise<SummedFood> {
        return await invoke<SummedFood>('find_calories_by_date', {
            dateToFind: date,
        });
    }
}