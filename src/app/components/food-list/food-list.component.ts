import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Food } from '@models/food.model';

@Component({
    selector: 'app-food-list',
    standalone: true,
    imports: [CommonModule, MatListModule],
    templateUrl: './food-list.component.html',
    styleUrl: './food-list.component.css',
})
export class FoodListComponent {
    foods = input.required<Array<Food>>();
}
