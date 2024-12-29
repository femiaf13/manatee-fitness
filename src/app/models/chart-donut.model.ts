import { ApexChart } from 'ng-apexcharts';

export class DonutChart {
    chart: ApexChart = {
        type: 'donut',
        fontFamily: 'Roboto, sans-serif',
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    };

    theme: ApexTheme = {
        mode: 'dark',
        palette: 'palette10',
    };

    labels: Array<string>;
    series: ApexNonAxisChartSeries;

    /**
     *
     * @param data Values for each category in the donut chart
     * @param labels Label for each category in the donut chart
     */
    constructor(data: Array<number>, labels: Array<string>) {
        this.series = data;
        this.labels = labels;
    }
}
