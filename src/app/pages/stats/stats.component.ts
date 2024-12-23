import { Component, inject } from '@angular/core';
import { BarChart } from '@models/chart-bar.model';
import { DateService } from '@services/date.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-stats',
    imports: [NgApexchartsModule],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.css',
})
export class StatsPageComponent {
    dateService = inject(DateService);
    public chartOptions: BarChart;

    constructor() {
        this.dateService.setTitle('Stats');
        this.chartOptions = new BarChart(
            [110, 141, 135, 151, 149, 162, 169, 191, 148, 110, 141, 135, 151, 149, 162, 169, 191, 148],
            [
                '2024-11-29',
                '2024-11-30',
                '2024-12-01',
                '2024-12-03',
                '2024-12-04',
                '2024-11-05',
                '2024-12-06',
                '2024-12-08',
                '2024-12-09',
                '2024-12-10',
                '2024-12-11',
                '2024-12-12',
                '2024-12-14',
                '2024-12-16',
                '2024-12-18',
                '2024-12-19',
                '2024-12-20',
                '2024-12-31',
            ],
            'Calories',
            'Calories for <date-range>'
        );
    }
}
