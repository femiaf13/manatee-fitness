import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { BarChart } from '@models/chart-bar.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { subDays } from 'date-fns';
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

    chartOptions = signal<BarChart>(new BarChart([], [], '', ''));

    constructor() {
        this.dateService.setTitle('Stats');

        effect(() => {
            const selectedDate = this.dateService.selectedDate();

            untracked(() => {
                this.databaseService.getGoal().then(goal => {
                    const endDate = this.dateService.selectedDateFormatted();
                    const startDate = DateService.formateDate(subDays(selectedDate, 30));
                    this.databaseService.getsummedFoodBetweenDates(startDate, endDate).then(summedFoods => {
                        // Split the actual return into seperate arrays and pass into bar chart constructor
                        const calorieData: Array<number> = [];
                        const dateData: Array<string> = [];
                        const yAxisTitle = 'Calories';

                        for (const summedFood of summedFoods) {
                            calorieData.push(summedFood.calories);
                            dateData.push(summedFood.date);
                        }

                        const title = `Calories: ${dateData[0]} to ${dateData[dateData.length - 1]}`;
                        this.chartOptions.set(new BarChart(calorieData, dateData, yAxisTitle, title, goal?.calories));
                    });
                });
            });
        });
    }
}
