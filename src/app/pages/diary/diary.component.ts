import { Component, effect, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { MatButtonModule } from '@angular/material/button';

import { Meal, MealDTO } from '@models/meal.model';
import { MealCardComponent } from "@components/meal-card/meal-card.component";
import { DateService } from '@services/date.service';


@Component({
  selector: 'app-page-diary',
  standalone: true,
  imports: [MealCardComponent, MatButtonModule],
  templateUrl: './diary.component.html',
  styleUrl: './diary.component.css'
})
export class DiaryComponent {
    dateService = inject(DateService);
    today = this.dateService.selectedDateFormatted;
    meals: Array<Meal> = [];

    constructor() {
        effect(() => {
            invoke<Array<Meal>>("find_meals_by_date", { dateToFind: this.today() }).then( (meals) => this.meals = meals);
        })
        
    }

    async addDinner() {
        const meals = await invoke<Array<Meal>>("find_meals_by_date", { dateToFind: this.today() });
        console.log(JSON.stringify(meals));
        if (meals.length === 0 ) {
            const meal: MealDTO = {
                meal_name: 'dinner',
                meal_date: this.today()
            }
            const success = await invoke<boolean>("create_meal", {meal: meal});
            if (success) {
                invoke<Array<Meal>>("find_meals_by_date", { dateToFind: this.today() }).then( (meals) => this.meals = meals);
            } else {
                console.error("Failed to insert")
            }
        }
      }
}
