import { Injectable } from '@angular/core';
import { FoodDTO } from '@models/food.model';

@Injectable({
    providedIn: 'root',
})
export class OpenFoodFactsService {
    constructor() {}

    public async searchByText(searchTerm: string): Promise<Array<FoodDTO>> {
        return [];
    }

    public async searchByBarcode(barcode: string): Promise<FoodDTO> {
        const foodResult = new FoodDTO(barcode);

        return foodResult;
    }
}
