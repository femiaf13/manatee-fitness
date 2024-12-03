import { Injectable } from '@angular/core';
import { FoodDTO } from '@models/food.model';
import { getVersion } from '@tauri-apps/api/app';
import { fetch } from '@tauri-apps/plugin-http';

@Injectable({
    providedIn: 'root',
})
export class OpenFoodFactsService {
    USER_AGENT: string = 'Manatee Fitness - Android - Version unknown - https://github.com/femiaf13/manatee-fitness';

    constructor() {
        getVersion().then(appVersion => {
            this.USER_AGENT = `Manatee Fitness - Android - Version ${appVersion} - https://github.com/femiaf13/manatee-fitness`;
        });
    }

    public async searchByText(searchTerm: string): Promise<Array<FoodDTO>> {
        const urlSafeSearchTerm = encodeURIComponent(searchTerm);
        const pageSize = 50;
        let url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${urlSafeSearchTerm}&search_simple=1&action=process&json=1&sort_by=unique_scans_n&page_size=${pageSize}`;

        const searchLanguage = 'en';
        url += `&tagtype_0=languages&tag_contains_0=contains&tag_0=${searchLanguage}`;

        const searchCountry = encodeURIComponent('United States');
        url += `&tagtype_1=countries&tag_contains_1=contains&tag_1=${searchCountry}`;
        try {
            const response = await fetch(url, { headers: { 'User-Agent': this.USER_AGENT } });
            const jsonResponse = await response.json();

            // TODO: A bunch of processing to make it the format we want
            return this.parseJsonResponse(jsonResponse);
        } catch (error) {
            console.error(`Error fetching from Open Food Facts: ${JSON.stringify(error)}`);
            return [];
        }
    }

    public async searchByBarcode(barcode: string): Promise<FoodDTO> {
        const foodResult = new FoodDTO(barcode);

        return foodResult;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parseJsonResponse(offResponse: any): Array<FoodDTO> {
        const foods: Array<FoodDTO> = [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            offResponse['products'].forEach((product: any) => {
                const food = new FoodDTO();
                // Food description is required
                if (!('product_name' in product)) {
                    return;
                } else {
                    food.description = product['product_name'];
                }

                if ('brands' in product) {
                    food.brand = product['brands'];
                }

                if ('code' in product) {
                    food.barcode = product['code'];
                }

                // If this isn't true than a lot of math is required
                if (product['nutrition_data_prepared_per'] !== '100g') {
                    return;
                }

                if (!('nutriments' in product)) {
                    return;
                }
                const nutriments = product['nutriments'];

                if (!('energy-kcal_100g' in nutriments)) {
                    return;
                } else {
                    food.calories_per_100g = Number(nutriments['energy-kcal_100g']);
                }

                if ('carbohydrates_100g' in nutriments) {
                    food.carbs = Number(nutriments['carbohydrates_100g']);
                }

                if ('cholesterol_100g' in nutriments && 'cholesterol_unit' in nutriments) {
                    if (nutriments['cholesterol_unit'] === 'mg') {
                        food.cholesterol = Number(nutriments['cholesterol_100g']) * 1000;
                    }
                }

                if ('fat_100g' in nutriments) {
                    food.fat = Number(nutriments['fat_100g']);
                }

                if ('fiber_100g' in nutriments) {
                    food.fiber = Number(nutriments['fiber_100g']);
                }

                if ('proteins_100g' in nutriments) {
                    food.protein = Number(nutriments['proteins_100g']);
                }

                if ('sodium_100g' in nutriments && 'sodium_unit' in nutriments) {
                    if (nutriments['sodium_unit'] === 'g') {
                        food.sodium = Number(nutriments['sodium_100g']) * 1000;
                    } else if (nutriments['sodium_unit'] === 'mg') {
                        food.sodium = Number(nutriments['sodium_100g']);
                    }
                }

                // Grams per serving
                if (!('serving_quantity' in product)) {
                    return;
                } else {
                    food.grams_per_serving = Number(product['serving_quantity']);
                }
                // Serving text
                if ('serving_size' in product) {
                    food.serving_text = product['serving_size'];
                }

                foods.push(food);
            });
        } catch (error) {
            console.error(`Error fetching from Open Food Facts: ${JSON.stringify(error)}`);
            return [];
        }

        return foods;
    }
}
