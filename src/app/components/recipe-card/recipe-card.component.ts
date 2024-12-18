import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipeWithRecipeFoods } from '@models/recipe.model';

@Component({
    selector: 'app-recipe-card',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatExpansionModule, MatListModule, MatIconModule],
    templateUrl: './recipe-card.component.html',
    styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
    recipeWithRecipeFood = input.required<RecipeWithRecipeFoods>();

    totalCalories = computed(() => {
        let total = 0;
        for (const recipeFood of this.recipeWithRecipeFood().recipeFoods) {
            total += recipeFood.summed_food.calories;
        }
        return total;
    });
}
