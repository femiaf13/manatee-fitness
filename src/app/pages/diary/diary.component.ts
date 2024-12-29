import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MealDialogComponent, MealDialogData } from '@components/dialogs/meal/meal-dialog.component';
import { MealCardComponent } from '@components/meal-card/meal-card.component';
import { SwipeDirective } from '@directives/swipe.directive';
import { DonutChart } from '@models/chart-donut.model';
import { Goal } from '@models/goal.model';
import { Meal, MealDTO } from '@models/meal.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-page-diary',
    imports: [
        CommonModule,
        MealCardComponent,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        NgApexchartsModule,
        SwipeDirective,
    ],
    templateUrl: './diary.component.html',
    styleUrl: './diary.component.css',
})
export class DiaryComponent implements OnInit {
    databaseService = inject(DatabaseService);
    dateService = inject(DateService);
    dialog = inject(MatDialog);

    today = this.dateService.selectedDateFormatted;
    meals: Array<Meal> = [];
    totalCalories = 0;
    goal: Goal | undefined = undefined;
    caloriePercentageEaten: number = 0;

    chartOptions = signal<DonutChart>(new DonutChart([], []));

    constructor() {
        this.dateService.setTitle('Diary');
        effect(() => {
            const todayFormatted = this.today();

            untracked(() => {
                this.refreshMeals(todayFormatted);
            });
        });
    }

    async ngOnInit() {
        this.goal = await this.databaseService.getGoal();
        this.refreshMeals(this.today());
    }

    async addMeal() {
        const dialogData: MealDialogData = {
            modify: false,
        };
        const dialogRef = this.dialog.open(MealDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newMeal: MealDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newMeal !== undefined) {
            const success = await this.databaseService.createMeal(newMeal);
            if (!success) {
                console.error('Failed to add meal: ' + JSON.stringify(newMeal));
            }
        }
        // this.meals = await this.databaseService.getMealsByDate(this.today());
        this.refreshMeals(this.today());
    }

    async refreshMeals(dateString: string) {
        this.meals = await this.databaseService.getMealsByDate(dateString);
        const summedFoodForDay = await this.databaseService.getSummedFoodForDate(dateString);
        this.totalCalories = summedFoodForDay.calories;
        this.chartOptions.set(
            new DonutChart(
                [summedFoodForDay.carbs, summedFoodForDay.fat, summedFoodForDay.protein],
                ['Carbs', 'Fat', 'Protein'],
                'Macronutrients'
            )
        );
        if (this.goal !== undefined && this.goal.calories !== 0) {
            this.caloriePercentageEaten = Math.round((this.totalCalories / this.goal.calories) * 100);
        }
    }
}
