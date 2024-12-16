import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipeWithRecipeFoods } from '@models/recipefood.model';

@Component({
    selector: 'app-recipe-card',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatExpansionModule, MatListModule, MatIconModule],
    templateUrl: './recipe-card.component.html',
    styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
    recipeWithRecipeFood = input.required<RecipeWithRecipeFoods>();
}
