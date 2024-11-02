import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/core";

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Food } from '@models/food.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  greetingMessage = signal("");

  greet(event: SubmitEvent, foodDescription: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<Array<Food>>("find_foods_by_description", { foodDescription }).then((foods) => {
      // this.greetingMessage.set(`${food.description}: ${food.calories_per_100g}kcal/100g`);
      this.greetingMessage.set(JSON.stringify(foods));
    });
  }
}
