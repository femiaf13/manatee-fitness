import { Component, input } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { Meal } from '@models/meal.model';

@Component({
    selector: 'app-meal-card',
    standalone: true,
    imports: [MatButtonModule, MatCardModule, MatIconModule],
    templateUrl: './meal-card.component.html',
    styleUrl: './meal-card.component.css'
})
export class MealCardComponent {
    meal = input.required<Meal>();
}
