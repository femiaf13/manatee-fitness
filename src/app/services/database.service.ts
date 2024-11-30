import { Injectable } from '@angular/core';
import { Food, FoodDTO, SummedFood } from '@models/food.model';
import { Meal, MealDTO } from '@models/meal.model';
import { MealFood, SummedMealFood } from '@models/mealfood.model';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    /**
     *
     * @param food food to create
     * @returns true on success, false on error
     */
    public async createFood(food: FoodDTO): Promise<boolean> {
        return await invoke<boolean>('create_food', { food: food });
    }

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
     * @param mealfood mealfood to create
     * @returns true on success, false on error
     */
    public async createMealFood(mealFood: MealFood): Promise<boolean> {
        return await invoke<boolean>('create_mealfood', { mealfood: mealFood });
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
     * @param mealId ID of the meal
     * @returns summed nutritional info for each food in the meal
     */
    public async getSummedFoodByMeal(mealId: number): Promise<Array<SummedMealFood>> {
        return await invoke<Array<SummedMealFood>>('find_summed_mealfood_by_meal', { mealId: mealId });
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

    /**
     *
     * @param foodId ID for the food that will be updated
     * @param food DTO post-modification of the food
     * @returns true on success, false on error
     */
    public async updateFoodByDto(foodId: number, food: FoodDTO): Promise<boolean> {
        return await invoke<boolean>('update_food_by_dto', {
            foodId: foodId,
            foodDto: food,
        });
    }

    /**
     *
     * @param foodId ID for the meal that will be updated
     * @param meal DTO post-modification of the meal
     * @returns true on success, false on error
     */
    public async updateMealByDto(mealId: number, meal: MealDTO): Promise<boolean> {
        return await invoke<boolean>('update_meal_by_dto', {
            mealId: mealId,
            mealDto: meal,
        });
    }
}
