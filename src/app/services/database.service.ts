import { Injectable } from '@angular/core';
import { Food, SummedFood } from '@models/food.model';
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
     * Search foods' descriptions and brands
     * @param searchTerm Term to search by
     * @returns all foods that contain the search term
     */
    public async getFoodsBySearch(searchTerm: string): Promise<Array<Food>> {
        return await invoke<Array<Food>>('find_foods_by_search', { searchTerm: searchTerm });
    }

    /**
     *
     * @param id id to retrieve
     * @returns meal a the passed in ID
     */
    public async getMealById(id: number): Promise<Meal> {
        return await invoke<Meal>('find_meal_by_id', { mealId: id });
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
