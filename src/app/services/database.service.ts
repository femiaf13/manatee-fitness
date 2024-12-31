import { Injectable } from '@angular/core';
import { Food, FoodDTO, SummedFood, SummedFoodWithDate } from '@models/food.model';
import { Goal } from '@models/goal.model';
import { Meal, MealDTO } from '@models/meal.model';
import { MealFood, SummedMealFood } from '@models/mealfood.model';
import { invoke } from '@tauri-apps/api/core';
import { load, Store } from '@tauri-apps/plugin-store';
import { platform } from '@tauri-apps/plugin-os';
import { RecipeFood } from '@models/recipefood.model';
import { Recipe, SummedRecipeFood } from '@models/recipe.model';
import { WeighIn, WeighInDTO } from '@models/weigh-in.model';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    readonly APP_STORE = 'store.json';
    goalStore: Store | undefined;
    readonly PLATFORM = platform();

    private async loadGoalStore(): Promise<Store> {
        return await load(this.APP_STORE, { autoSave: 100 });
    }

    public async getGoal(): Promise<Goal | undefined> {
        if (this.goalStore === undefined) {
            this.goalStore = await this.loadGoalStore();
        }
        return await this.goalStore.get<Goal>('goal');
    }

    public async setGoal(goal: Goal) {
        if (this.goalStore === undefined) {
            this.goalStore = await this.loadGoalStore();
        }
        await this.goalStore.set('goal', goal);
    }

    public isMobilePlatform(): boolean {
        return this.PLATFORM == 'android' || this.PLATFORM == 'ios';
    }

    /** SQL DATA BELOW */

    /**
     *
     * @param food food to create
     * @returns created food on success, error message on error
     */
    public async createFood(food: FoodDTO): Promise<Food | string> {
        try {
            return await invoke<Food>('create_food', { food: food });
        } catch (error) {
            return JSON.stringify(error);
        }
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
     *
     * @param mealId meal id to for the new mealfood
     * @param recipeId recipe to pull recipefoods from
     * @returns true on success, false on error
     */
    public async createMealFoodsFromRecipe(mealId: number, recipeId: number): Promise<boolean> {
        return await invoke<boolean>('create_mealfoods_from_recipe', { mealId: mealId, recipeId: recipeId });
    }

    /**
     *
     * @param mealId meal to delete
     * @returns true on success, false on error
     */
    public async deleteMeal(mealId: number): Promise<boolean> {
        return await invoke<boolean>('delete_meal', { mealId: mealId });
    }

    /**
     *
     * @param mealId mealfood meal id to delete
     * @param foodId mealfood food id to delete
     * @returns true on success, false on error
     */
    public async deleteMealFood(mealId: number, foodId: number): Promise<boolean> {
        return await invoke<boolean>('delete_mealfood', { mealId: mealId, foodId: foodId });
    }

    /**
     * Search foods' descriptions and brands
     * @param barcode Barcode to search by
     * @returns all foods that match the barcode
     */
    public async getFoodsByBarcode(barcode: string): Promise<Array<Food>> {
        return await invoke<Array<Food>>('find_foods_by_barcode', { foodBarcode: barcode });
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

    public async getsummedFoodBetweenDates(startDate: string, endDate: string): Promise<Array<SummedFoodWithDate>> {
        return await invoke<SummedFoodWithDate[]>('find_calories_between_dates', {
            startDate: startDate,
            endDate: endDate,
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
     * @param mealId ID for the meal that will be updated
     * @param meal DTO post-modification of the meal
     * @returns true on success, false on error
     */
    public async updateMealByDto(mealId: number, meal: MealDTO): Promise<boolean> {
        return await invoke<boolean>('update_meal_by_dto', {
            mealId: mealId,
            mealDto: meal,
        });
    }

    /**
     *
     * @param mealFood Meal food post modification
     * @returns true on success, false on error
     */
    public async updateMealFood(mealFood: MealFood): Promise<boolean> {
        return await invoke<boolean>('update_mealfood', {
            mealfood: mealFood,
        });
    }

    /** Recipe Methods */

    /**
     *
     * @param recipeName Name for the recipe
     * @returns true on success, false on error
     */
    public async createRecipe(recipeName: string): Promise<boolean> {
        return await invoke<boolean>('create_recipe', { recipeName: recipeName });
    }

    /**
     *
     * @param id id to retrieve
     * @returns recipe for the passed in ID
     */
    public async getRecipeById(id: number): Promise<Recipe> {
        return await invoke<Recipe>('find_recipe_by_id', { recipeId: id });
    }

    /**
     *
     * @returns All recipes in the database
     */
    public async getRecipes(): Promise<Array<Recipe>> {
        return await invoke<Array<Recipe>>('find_recipes');
    }

    /**
     *
     * @param recipeId ID of the recipe
     * @returns summed nutritional info for each food in the recipe
     */
    public async getSummedFoodByRecipe(recipeId: number): Promise<Array<SummedRecipeFood>> {
        return await invoke<Array<SummedRecipeFood>>('find_summed_mealfood_by_recipe', { recipeId: recipeId });
    }

    /**
     * Update the name of a recipe
     * @param recipeId ID of the recipe that will be changed
     * @param recipeName New name for the recipe
     * @returns true on success, false on error
     */
    public async updateRecipe(recipeId: number, recipeName: string): Promise<boolean> {
        return await invoke<boolean>('update_recipe', { recipeId: recipeId, newName: recipeName });
    }

    /**
     * Deletes a recipe and all recipe foods in it
     * @param recipeId ID of the recipe that will be deleted
     * @returns true on success, false on error
     */
    public async deleteRecipe(recipeId: number): Promise<boolean> {
        return await invoke<boolean>('delete_recipe', { recipeId: recipeId });
    }

    /** Recipefood Methods */

    /**
     *
     * @param recipeFood recipefood to create
     * @returns true on success, false on error
     */
    public async createRecipeFood(recipeFood: RecipeFood): Promise<boolean> {
        return await invoke<boolean>('create_recipefood', { recipeFood: recipeFood });
    }

    /**
     *
     * @param recipeId recipe id used to find recipefoods
     * @returns true on success, false on error
     */
    public async getRecipeFoodsByRecipe(recipeId: number): Promise<Array<RecipeFood>> {
        return await invoke<Array<RecipeFood>>('find_recipefood_by_recipe', { recipeId: recipeId });
    }

    /**
     * Update individual food in a recipe
     * @param recipeFood Recipe Food post modification
     * @returns true on success, false on error
     */
    public async updateRecipeFood(recipeFood: RecipeFood): Promise<boolean> {
        return await invoke<boolean>('update_recipefood', { recipeFood: recipeFood });
    }

    /**
     * Deletes a recipe food
     * @param recipeId recipe food recipe id to delete
     * @param foodId recipe food food id to delete
     * @returns true on success, false on error
     */
    public async deleteRecipeFood(recipeId: number, foodId: number): Promise<boolean> {
        return await invoke<boolean>('delete_recipefood', { recipeId: recipeId, foodId: foodId });
    }

    /** Weigh-in Methods */

    /**
     * Create a new weigh-in
     * @param weighIn Weigh-in to create
     * @returns true on success, false on error
     */
    public async createWeighIn(weighIn: WeighInDTO): Promise<boolean> {
        return await invoke<boolean>('create_weigh_in', {
            weighIn: weighIn,
        });
    }

    /**
     * Get all weigh ins between start date and end date
     * @param startDate date formatted as YYYY-MM-DD
     * @param endDate date formatted as YYYY-MM-DD
     * @returns Array of all weigh-ins between suplied dates
     */
    public async getWeighInsBetweenDates(startDate: string, endDate: string): Promise<WeighIn[]> {
        return await invoke<WeighIn[]>('find_weigh_ins_between_dates', {
            startDate: startDate,
            endDate: endDate,
        });
    }

    /**
     * Update a weigh-in
     * @param weighInId ID of the weigh-in that will be updated
     * @param weighIn Weigh-in data to update
     * @returns true on success, false on error
     */
    public async updateWeighIn(weighInId: number, weighIn: WeighInDTO): Promise<boolean> {
        return await invoke<boolean>('update_weigh_in_by_dto', {
            weighInId: weighInId,
            weighInDto: weighIn,
        });
    }

    /**
     * Delete a weigh-in
     * @param weighInId ID of the weigh-in that will be deleted
     * @returns true on success, false on error
     */
    public async deleteWeighIn(weighInId: number): Promise<boolean> {
        return await invoke<boolean>('delete_weigh_in', {
            weighInId: weighInId,
        });
    }
}
