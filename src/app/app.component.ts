import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/core";

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { addDays, format } from "date-fns";

import { Food } from '@models/food.model';
import { Meal } from '@models/meal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  greetingMessage = signal("");

  todayDate = signal(new Date())
  todayFormatted = computed(() => format(this.todayDate(), "yyyy-MM-dd"));
  tomorrowFormatted = computed(() => {
    return format(addDays(this.todayDate(), 1), "yyyy-MM-dd")
  } )

  greet(event: SubmitEvent, foodDescription: string): void {
    event.preventDefault();

    this.todayDate.set( addDays(this.todayDate(), -1) )
    const dateToFind = this.todayFormatted();

    invoke<Array<Meal>>("find_meals_by_date", { dateToFind }).then( (meals) => {
      this.greetingMessage.set(JSON.stringify(meals));
    });

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<Array<Food>>("find_foods_by_description", { foodDescription }).then((foods) => {
      // this.greetingMessage.set(`${food.description}: ${food.calories_per_100g}kcal/100g`);
      // this.greetingMessage.set(JSON.stringify(foods));
    });
  }
}
