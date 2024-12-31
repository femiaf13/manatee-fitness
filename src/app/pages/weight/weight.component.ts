import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    resource,
    ResourceStatus,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { WeighInDialogComponent, WeighInDialogData } from '@components/dialogs/weighin-dialog/weighin-dialog.component';
import { LineChart } from '@models/chart-line.model';
import { WeighIn, WeighInDTO } from '@models/weigh-in.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { subDays } from 'date-fns';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-page-weight',
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
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
    dialog = inject(MatDialog);

    // This gets us a reference to the chart's component, needed
    // for the jank described below
    chart = viewChild(ChartComponent);

    lineChartOptions = signal<LineChart>(new LineChart([], [], [], ''));

    private formBuilder = inject(NonNullableFormBuilder);
    dateRangeForm = this.formBuilder.group({
        start: [subDays(this.dateService.selectedDate(), 30), [Validators.required]],
        end: [this.dateService.selectedDate(), [Validators.required]],
        useMetric: [false],
    });

    startDateSignal = toSignal(this.dateRangeForm.controls.start.valueChanges, {
        initialValue: this.dateRangeForm.controls.start.value,
    });
    endDateSignal = toSignal(this.dateRangeForm.controls.end.valueChanges, {
        initialValue: this.dateRangeForm.controls.end.value,
    });

    useMetricSignal = toSignal(this.dateRangeForm.controls.useMetric.valueChanges, {
        initialValue: this.dateRangeForm.controls.useMetric.value,
    });

    weighIns = signal<Array<WeighIn>>([]);

    // Trying something experimental with a resource signal
    todaysWeighInResource = resource({
        // The request value recomputes whenever any read signals change.
        request: () => ({ today: this.dateService.selectedDateFormatted() }),
        // The resource calls this function every time the `request` value changes.
        loader: ({ request }) => this.databaseService.getWeighInsBetweenDates(request.today, request.today),
    });
    /** Create a computed signals based on the result of the resource's loader function. */
    // Signal to be able to tell when the request is done
    isResourceResolved = computed(() => this.todaysWeighInResource.status() == ResourceStatus.Resolved);
    // Has there been a weigh in today? Will control which icon gets displayed
    alreadyWeighedInToday = computed(() => {
        const databaseResult = this.todaysWeighInResource.value();
        if (databaseResult === undefined) {
            return false;
        }
        return databaseResult.length > 0;
    });
    todaysWeighIn = computed(() => {
        return this.todaysWeighInResource.value();
    });

    async addWeight() {
        const placeholderWeighIn = new WeighInDTO();
        placeholderWeighIn.weigh_in_date = this.dateService.selectedDateFormatted();
        const dialogData: WeighInDialogData = {
            modify: false,
            weighIn: placeholderWeighIn,
        };
        const dialogRef = this.dialog.open(WeighInDialogComponent, {
            data: dialogData,
            disableClose: true,
        });
        const newWeighIn: WeighInDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
        if (newWeighIn !== undefined) {
            const success = await this.databaseService.createWeighIn(newWeighIn);
            if (!success) {
                console.error('Failed to add weigh-in: ' + JSON.stringify(newWeighIn));
            }
            // TODO: This is repeated code but I'll fix it later(which we all know means never)
            const endDate = DateService.formateDate(this.endDateSignal());
            const startDate = DateService.formateDate(this.startDateSignal());
            const unit = this.useMetricSignal() ? 'kg' : 'lbs';
            await this.refreshWeightChart(startDate, endDate, unit);
            this.todaysWeighInResource.reload();
        }
    }

    async modifyWeight() {
        const todaysWeighIn = this.todaysWeighIn();
        if (todaysWeighIn !== undefined) {
            const dialogData: WeighInDialogData = {
                modify: true,
                // Just accessing first element feels wrong but will
                // always be right based on how it's called
                weighIn: todaysWeighIn[0],
            };
            const dialogRef = this.dialog.open(WeighInDialogComponent, {
                data: dialogData,
                disableClose: true,
            });
            const newWeighIn: WeighInDTO | undefined = await lastValueFrom(dialogRef.afterClosed());
            if (newWeighIn !== undefined) {
                const success = await this.databaseService.updateWeighIn(todaysWeighIn[0].id, newWeighIn);
                if (!success) {
                    console.error('Failed to update weigh-in: ' + JSON.stringify(newWeighIn));
                }
                // TODO: This is repeated code but I'll fix it later(which we all know means never)
                const endDate = DateService.formateDate(this.endDateSignal());
                const startDate = DateService.formateDate(this.startDateSignal());
                const unit = this.useMetricSignal() ? 'kg' : 'lbs';
                await this.refreshWeightChart(startDate, endDate, unit);
                this.todaysWeighInResource.reload();
            }
        }
    }

    /**
     * Calculate an exponential moving average with 10% smoothing
     * @param weights raw weight data
     * @returns Weight data after smoothing
     */
    calculateTrendData(weights: Array<number>): Array<number> {
        const smoothedWeights: Array<number> = [];

        if (weights.length >= 1) {
            smoothedWeights.push(weights[0]);

            for (let i = 1; i < weights.length; i++) {
                const weight = weights[i];
                const prevElement = smoothedWeights[i - 1];
                // Round after smoothing it to prevent ugly numbers
                const smoothedWeight = (prevElement + 0.1 * (weight - prevElement)).toFixed(1);

                smoothedWeights.push(+smoothedWeight);
            }
        }

        return smoothedWeights;
    }

    async refreshWeightChart(startDate: string, endDate: string, unit: string) {
        this.databaseService.getWeighInsBetweenDates(startDate, endDate).then(weighIns => {
            // Split the actual return into seperate arrays and pass into line chart constructor
            const weightData: Array<number> = [];
            const dateData: Array<string> = [];

            for (const weighIn of weighIns) {
                if (this.useMetricSignal()) {
                    weightData.push(+weighIn.weight_kg.toFixed(1));
                } else {
                    weightData.push(+weighIn.weight_lb.toFixed(1));
                }
                dateData.push(weighIn.weigh_in_date);
            }

            const title = `Weight(${unit}): ${dateData[0]} to ${dateData[dateData.length - 1]}`;
            // Blank the data before updating it because it might help
            // with the bug described below
            this.chart()?.updateSeries([], false);
            /**
             * JANK VARIETY HOUR
             *
             * This is happening because for some reason if we don't
             * then my pixel 7a will not update until another UI element
             * is interacted with. This bug was not present on desktop, the
             * android emulator, OR my phone when running over the debugger...
             */
            setTimeout(() => {
                this.lineChartOptions.set(
                    new LineChart(
                        [weightData, this.calculateTrendData(weightData)],
                        dateData,
                        ['Exact Measurements', 'Smoothed Data'],
                        title
                    )
                );
            }, 250);
        });
    }

    constructor() {
        this.dateService.setTitle('Weight');
        effect(() => {
            const endDate = DateService.formateDate(this.endDateSignal());
            const startDate = DateService.formateDate(this.startDateSignal());
            const unit = this.useMetricSignal() ? 'kg' : 'lbs';

            untracked(() => {
                this.refreshWeightChart(startDate, endDate, unit);
            });
        });
    }
}
