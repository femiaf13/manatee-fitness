import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { FoodDialogData, FoodDialogComponent } from '@components/dialogs/food/food-dialog.component';
import { Food, FoodDTO } from '@models/food.model';
import { DatabaseService } from '@services/database.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-food-list',
    standalone: true,
    imports: [CommonModule, MatListModule],
    templateUrl: './food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class FoodListComponent {
    dialog = inject(MatDialog);
    databaseService = inject(DatabaseService);
    foods = input.required<Array<Food>>();

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
            const success = await this.databaseService.updateFoodByDescription(food.id, newFood);
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(newFood));
            }
        }
    }
}
