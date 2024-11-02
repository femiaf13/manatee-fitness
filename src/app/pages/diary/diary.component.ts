import { Component, effect, input } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { Meal } from '@models/meal.model';
import { MealCardComponent } from "@components/meal-card/meal-card.component";


@Component({
  selector: 'page-diary',
  standalone: true,
  imports: [MealCardComponent],
  templateUrl: './diary.component.html',
  styleUrl: './diary.component.css'
})
export class DiaryComponent {
    today = input.required<string>();
    meals: Array<Meal> = [];

    constructor() {
        effect(() => {
            invoke<Array<Meal>>("find_meals_by_date", { dateToFind: this.today() }).then( (meals) => this.meals = meals);
        })
        
    }
}
