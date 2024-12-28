import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BarChart } from '@models/chart-bar.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
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

    chartOptions = signal<BarChart>(new BarChart([], [], '', ''));

    private formBuilder = inject(NonNullableFormBuilder);
    dateRangeForm = this.formBuilder.group({
        start: [this.dateService.selectedDate(), [Validators.required]],
        end: [this.dateService.selectedDate(), [Validators.required]],
    });

    startDateSignal = toSignal(this.dateRangeForm.controls.start.valueChanges, {
        initialValue: this.dateService.selectedDate(),
    });
    endDateSignal = toSignal(this.dateRangeForm.controls.end.valueChanges, {
        initialValue: this.dateService.selectedDate(),
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
