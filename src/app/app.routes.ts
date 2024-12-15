import { Routes } from '@angular/router';
import { DiaryComponent } from '@pages/diary/diary.component';
import { FoodPageComponent } from '@pages/food/food.component';
import { GoalsComponent } from '@pages/goals/goals.component';
import { RecipesPageComponent } from '@pages/recipes/recipes.component';

export const routes: Routes = [
    { path: 'diary', component: DiaryComponent },
    { path: 'goals', component: GoalsComponent },
    { path: 'food', component: FoodPageComponent },
    { path: 'recipes', component: RecipesPageComponent },
    { path: '**', component: DiaryComponent },
];
