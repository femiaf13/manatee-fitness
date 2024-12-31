import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BarChart } from '@models/chart-bar.model';
import { DonutChart } from '@models/chart-donut.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { subDays } from 'date-fns';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-stats',
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatGridListModule,
        MatSelectModule,
        NgApexchartsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPageComponent {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);

    barChartOptions = signal<BarChart>(new BarChart([], [], '', ''));
    donutChartOptions = signal<DonutChart>(new DonutChart([], []));

    readonly selectionOptions = ['Calories', 'Fat', 'Carbs', 'Protein', 'Cholesterol', 'Fiber', 'Sodium'];

    private formBuilder = inject(NonNullableFormBuilder);
    dateRangeForm = this.formBuilder.group({
        start: [subDays(this.dateService.selectedDate(), 7), [Validators.required]],
        end: [this.dateService.selectedDate(), [Validators.required]],
        dataToGraph: ['Calories', [Validators.required]],
    });

    startDateSignal = toSignal(this.dateRangeForm.controls.start.valueChanges, {
        initialValue: subDays(this.dateService.selectedDate(), 7),
    });
    endDateSignal = toSignal(this.dateRangeForm.controls.end.valueChanges, {
        initialValue: this.dateService.selectedDate(),
    });
    dataToGraphSignal = toSignal(this.dateRangeForm.controls.dataToGraph.valueChanges, {
        initialValue: this.dateRangeForm.controls.dataToGraph.value,
    });

    constructor() {
        this.dateService.setTitle('Stats');

        effect(() => {
            const endDate = DateService.formateDate(this.endDateSignal());
            const startDate = DateService.formateDate(this.startDateSignal());

            untracked(() => {
                this.databaseService.getGoal().then(goal => {
                    this.databaseService.getsummedFoodBetweenDates(startDate, endDate).then(summedFoods => {
                        // Split the actual return into seperate arrays and pass into bar chart constructor
                        const calorieData: Array<number> = [];
                        const dateData: Array<string> = [];
                        const yAxisTitle = 'Calories';
                        // Variables for the donut chart
                        let summedFatData: number = 0;
                        let summedCarbsData: number = 0;
                        let summedProteinData: number = 0;

                        for (const summedFood of summedFoods) {
                            calorieData.push(summedFood.calories);
                            dateData.push(summedFood.date);
                            summedFatData += summedFood.fat;
                            summedCarbsData += summedFood.carbs;
                            summedProteinData += summedFood.protein;
                        }

                        const title = `Calories: ${dateData[0]} to ${dateData[dateData.length - 1]}`;
                        this.barChartOptions.set(
                            new BarChart(calorieData, dateData, yAxisTitle, title, goal?.calories)
                        );
                        this.donutChartOptions.set(
                            new DonutChart(
                                [summedCarbsData, summedFatData, summedProteinData],
                                ['Carbs', 'Fat', 'Protein'],
                                `Macronutrients: ${dateData[0]} to ${dateData[dateData.length - 1]}`
                            )
                        );
                    });
                });
            });
        });
    }
}
