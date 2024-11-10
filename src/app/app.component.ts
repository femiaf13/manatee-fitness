import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/core";
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { addDays, format } from "date-fns";

import { Food } from '@models/food.model';
import { Meal } from '@models/meal.model';
import { DiaryComponent } from '@pages/diary/diary.component'
import { DateService } from '@services/date.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatFormFieldModule, MatInputModule, DiaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  greetingMessage = signal("");
  dateService = inject(DateService);

  tomorrowFormatted = computed(() => {
    return format(addDays(this.dateService.selectedDate(), 1), "yyyy-MM-dd")
  } )

  greet(event: SubmitEvent, foodDescription: string): void {
    event.preventDefault();

    this.dateService.set( addDays(this.dateService.selectedDate(), -1) )

    invoke<Array<Meal>>("find_meals_by_date", { dateToFind: this.dateService.selectedDateFormatted() }).then( (meals) => {
      this.greetingMessage.set(JSON.stringify(meals));
    });

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    // invoke<Array<Food>>("find_foods_by_description", { foodDescription }).then((foods) => {
      // this.greetingMessage.set(`${food.description}: ${food.calories_per_100g}kcal/100g`);
      // this.greetingMessage.set(JSON.stringify(foods));
    // });
  }
}
