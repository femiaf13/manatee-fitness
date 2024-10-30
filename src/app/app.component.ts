import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/core";


class Food {
  id!: Number;
  description!: string;
  calories_per_100g!: Number;
  grams_per_serving!: Number;
  serving_text!: String;
  calories_per_serving!: Number;
  fat!: Number;
  carbs!: Number;
  protein!: Number;
  cholesterol!: Number;
  fiber!: Number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  greetingMessage = signal("");

  greet(event: SubmitEvent, foodDescription: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<Array<Food>>("find_food_by_description", { foodDescription }).then((foods) => {
      // this.greetingMessage.set(`${food.description}: ${food.calories_per_100g}kcal/100g`);
      this.greetingMessage.set(JSON.stringify(foods));
    });
  }
}
