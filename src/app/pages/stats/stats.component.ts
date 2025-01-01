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
import { SummedFoodDataTypes } from '@models/food.model';
import { Goal } from '@models/goal.model';
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

    readonly selectionOptions: Array<SummedFoodDataTypes> = [
        SummedFoodDataTypes.Calories,
        SummedFoodDataTypes.Fat,
        SummedFoodDataTypes.Carbs,
        SummedFoodDataTypes.Protein,
        SummedFoodDataTypes.Cholesterol,
        SummedFoodDataTypes.Fiber,
        SummedFoodDataTypes.Sodium,
    ];

    private formBuilder = inject(NonNullableFormBuilder);
    dateRangeForm = this.formBuilder.group({
        start: [subDays(this.dateService.selectedDate(), 7), [Validators.required]],
        end: [this.dateService.selectedDate(), [Validators.required]],
        dataToGraph: [SummedFoodDataTypes.Calories, [Validators.required]],
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

    /**
     *
     * @param goal goal object to extract goal value from
     * @param dataType which nutrient in the goal object we want
     * @returns the goal value for the nutrient if >0 else undefined
     */
    getValueFromGoalObject(goal: Goal | undefined, dataType: SummedFoodDataTypes): number | undefined {
        if (goal === undefined) {
            return undefined;
        }
        switch (dataType) {
            case SummedFoodDataTypes.Calories:
                return goal.calories > 0 ? goal.calories : undefined;
            case SummedFoodDataTypes.Fat:
                return goal.fat > 0 ? goal.fat : undefined;
            case SummedFoodDataTypes.Carbs:
                return goal.carbs > 0 ? goal.carbs : undefined;
            case SummedFoodDataTypes.Protein:
                return goal.protein > 0 ? goal.protein : undefined;
            case SummedFoodDataTypes.Cholesterol:
                return goal.cholesterol > 0 ? goal.cholesterol : undefined;
            case SummedFoodDataTypes.Fiber:
                return goal.fiber > 0 ? goal.fiber : undefined;
            case SummedFoodDataTypes.Sodium:
                return goal.sodium > 0 ? goal.sodium : undefined;
        }
    }

    constructor() {
        this.dateService.setTitle('Stats');

        effect(() => {
            const endDate = DateService.formateDate(this.endDateSignal());
            const startDate = DateService.formateDate(this.startDateSignal());
            const dataToGraph = this.dataToGraphSignal();

            untracked(() => {
                this.databaseService.getGoal().then(goal => {
                    this.databaseService.getsummedFoodBetweenDates(startDate, endDate).then(summedFoods => {
                        // Split the actual return into seperate arrays and pass into bar chart constructor
                        const barChartData: Array<number> = [];
                        const dateData: Array<string> = [];
                        const yAxisTitle = dataToGraph;
                        // Variables for the donut chart
                        let summedFatData: number = 0;
                        let summedCarbsData: number = 0;
                        let summedProteinData: number = 0;

                        for (const summedFood of summedFoods) {
                            switch (dataToGraph) {
                                case SummedFoodDataTypes.Calories:
                                    barChartData.push(summedFood.calories);
                                    break;
                                case SummedFoodDataTypes.Fat:
                                    barChartData.push(summedFood.fat);
                                    break;
                                case SummedFoodDataTypes.Carbs:
                                    barChartData.push(summedFood.carbs);
                                    break;
                                case SummedFoodDataTypes.Protein:
                                    barChartData.push(summedFood.protein);
                                    break;
                                case SummedFoodDataTypes.Cholesterol:
                                    barChartData.push(summedFood.cholesterol);
                                    break;
                                case SummedFoodDataTypes.Fiber:
                                    barChartData.push(summedFood.fiber);
                                    break;
                                case SummedFoodDataTypes.Sodium:
                                    barChartData.push(summedFood.sodium);
                                    break;
                            }

                            dateData.push(summedFood.date);
                            summedFatData += summedFood.fat;
                            summedCarbsData += summedFood.carbs;
                            summedProteinData += summedFood.protein;
                        }

                        const title = `${yAxisTitle}: ${dateData[0]} to ${dateData[dateData.length - 1]}`;
                        this.barChartOptions.set(
                            new BarChart(
                                barChartData,
                                dateData,
                                yAxisTitle,
                                title,
                                this.getValueFromGoalObject(goal, dataToGraph)
                            )
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
