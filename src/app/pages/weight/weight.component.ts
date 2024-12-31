import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LineChart } from '@models/chart-line.model';
import { WeighIn } from '@models/weigh-in.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { subDays } from 'date-fns';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-page-weight',
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        NgApexchartsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './weight.component.html',
    styleUrl: './weight.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightPageComponent {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);

    lineChartOptions = signal<LineChart>(new LineChart([], [], '', ''));

    private formBuilder = inject(NonNullableFormBuilder);
    dateRangeForm = this.formBuilder.group({
        start: [subDays(this.dateService.selectedDate(), 7), [Validators.required]],
        end: [this.dateService.selectedDate(), [Validators.required]],
        useMetric: [false],
        showTrend: [true],
    });

    startDateSignal = toSignal(this.dateRangeForm.controls.start.valueChanges, {
        initialValue: subDays(this.dateService.selectedDate(), 7),
    });
    endDateSignal = toSignal(this.dateRangeForm.controls.end.valueChanges, {
        initialValue: this.dateService.selectedDate(),
    });

    useMetricSignal = toSignal(this.dateRangeForm.controls.useMetric.valueChanges, {
        initialValue: this.dateRangeForm.controls.useMetric.value,
    });

    showTrendSignal = toSignal(this.dateRangeForm.controls.showTrend.valueChanges, {
        initialValue: this.dateRangeForm.controls.showTrend.value,
    });

    weighIns = signal<Array<WeighIn>>([]);

    constructor() {
        this.dateService.setTitle('Weight');
        effect(() => {
            const endDate = DateService.formateDate(this.endDateSignal());
            const startDate = DateService.formateDate(this.startDateSignal());
            const unit = this.useMetricSignal() ? 'kg' : 'lbs';

            untracked(() => {
                this.databaseService.getWeighInsBetweenDates(startDate, endDate).then(weighIns => {
                    // Split the actual return into seperate arrays and pass into bar chart constructor
                    const weightData: Array<number> = [];
                    const dateData: Array<string> = [];

                    for (const weighIn of weighIns) {
                        if (this.useMetricSignal()) {
                            weightData.push(weighIn.weight_kg);
                        } else {
                            weightData.push(+weighIn.weight_lb.toFixed(1));
                        }

                        dateData.push(weighIn.weigh_in_date);
                    }

                    const title = `Weight(${unit}): ${dateData[0]} to ${dateData[dateData.length - 1]}`;
                    this.lineChartOptions.set(new LineChart(weightData, dateData, unit, title));
                });
            });
        });
    }
}
