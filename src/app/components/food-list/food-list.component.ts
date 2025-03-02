import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Food, FoodDTO } from '@models/food.model';
import { Recipe } from '@models/recipe.model';
import { DatabaseService } from '@services/database.service';

class BaseFoodListComponent {
    dialog = inject(MatDialog);
    databaseService = inject(DatabaseService);
}

@Component({
    selector: 'app-food-list',
    imports: [CommonModule, MatDividerModule, MatListModule],
    templateUrl: './local-food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class LocalFoodListComponent extends BaseFoodListComponent {
    foods = input.required<Array<Food | Recipe>>();
    foodSelected = output<Food | Recipe>();
}

@Component({
    selector: 'app-off-food-list',
    imports: [CommonModule, MatDividerModule, MatListModule],
    templateUrl: './food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class OpenFoodFactsFoodListComponent extends BaseFoodListComponent {
    foods = input.required<Array<FoodDTO>>();
    foodSelected = output<FoodDTO>();
}
