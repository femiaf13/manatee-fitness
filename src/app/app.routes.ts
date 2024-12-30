import { Routes } from '@angular/router';
import { DiaryComponent } from '@pages/diary/diary.component';
import { FoodPageComponent } from '@pages/food/food.component';
import { GoalsComponent } from '@pages/goals/goals.component';
import { RecipesPageComponent } from '@pages/recipes/recipes.component';
import { StatsPageComponent } from '@pages/stats/stats.component';
import { WeightPageComponent } from '@pages/weight/weight.component';

export const routes: Routes = [
    { path: 'diary', component: DiaryComponent },
    { path: 'goals', component: GoalsComponent },
    { path: 'food', component: FoodPageComponent },
    { path: 'recipes', component: RecipesPageComponent },
    { path: 'stats', component: StatsPageComponent },
    { path: 'weight', component: WeightPageComponent },
    { path: '**', component: DiaryComponent },
];
