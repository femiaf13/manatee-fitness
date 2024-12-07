import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FoodDialogData, FoodDialogComponent } from '@components/dialogs/food/food-dialog.component';
import { Food, FoodDTO } from '@models/food.model';
import { DatabaseService } from '@services/database.service';
import { lastValueFrom } from 'rxjs';

class BaseFoodListComponent {
    dialog = inject(MatDialog);
    databaseService = inject(DatabaseService);
}

@Component({
    selector: 'app-food-list',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatListModule],
    templateUrl: './food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class LocalFoodListComponent extends BaseFoodListComponent {
    foods = input.required<Array<Food>>();
    foodChanged = output<void>();

    async modifyFood(food: Food) {
        const dialogData: FoodDialogData = {
            modify: true,
            food: food,
        };
        const dialogRef = this.dialog.open(FoodDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            data: dialogData,
            disableClose: true,
        });
        const newFood: FoodDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newFood !== undefined) {
            const success = await this.databaseService.updateFoodByDto(food.id, newFood);
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(newFood));
            }
            this.foodChanged.emit();
        }
    }
}

@Component({
    selector: 'app-off-food-list',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatListModule],
    templateUrl: './food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class OpenFoodFactsFoodListComponent extends BaseFoodListComponent {
    foods = input.required<Array<FoodDTO>>();

    async modifyFood(food: FoodDTO) {
        const dialogData: FoodDialogData = {
            modify: true,
            food: food,
        };
        const dialogRef = this.dialog.open(FoodDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            data: dialogData,
            disableClose: true,
        });
        const newFood: FoodDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newFood !== undefined) {
            const success = await this.databaseService.createFood(newFood);
            if (!success) {
                console.error('Failed to add food: ' + JSON.stringify(newFood));
            }
        }
    }
}
