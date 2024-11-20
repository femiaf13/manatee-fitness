import { Routes } from '@angular/router';
import { DiaryComponent } from '@pages/diary/diary.component';
import { FoodComponent } from '@pages/food/food.component';

export const routes: Routes = [
    { path: 'diary', component: DiaryComponent },
    { path: 'food', component: FoodComponent },
    { path: '**', component: DiaryComponent },
];
