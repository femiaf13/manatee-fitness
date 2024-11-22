import { Routes } from '@angular/router';
import { DiaryComponent } from '@pages/diary/diary.component';
import { FoodPageComponent } from '@pages/food/food.component';

export const routes: Routes = [
    { path: 'diary', component: DiaryComponent },
    { path: 'food', component: FoodPageComponent },
    { path: '**', component: DiaryComponent },
];
