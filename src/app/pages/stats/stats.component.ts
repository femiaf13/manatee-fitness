import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BarChart } from '@models/chart-bar.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-stats',
    imports: [NgApexchartsModule],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPageComponent {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);

    public chartOptions!: BarChart;

    constructor() {
        this.dateService.setTitle('Stats');
        this.databaseService.getGoal().then(goal => {
            this.databaseService.getsummedFoodBetweenDates('2024-11-30', '2024-12-30').then(summedFoods => {
                // Split the actual return into seperate arrays and pass into bar chart constructor
                const calorieData: Array<number> = [];
                const dateData: Array<string> = [];
                const yAxisTitle = 'Calories';

                for (const summedFood of summedFoods) {
                    calorieData.push(summedFood.calories);
                    dateData.push(summedFood.date);
                }

                const title = `Calories: ${dateData[0]} to ${dateData[dateData.length - 1]}`;
                this.chartOptions = new BarChart(calorieData, dateData, yAxisTitle, title, goal?.calories);
            });
        });
    }
}
