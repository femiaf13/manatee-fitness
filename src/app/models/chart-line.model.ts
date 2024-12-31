import { ApexChart, ApexStroke } from 'ng-apexcharts';

export class LineChart {
    annotations: ApexAnnotations = {};

    chart: ApexChart = {
        height: 450,
        type: 'line',
        fontFamily: 'Roboto, sans-serif',
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    };

    dataLabels: ApexDataLabels = {
        enabled: false,
    };

    stroke: ApexStroke = {
        curve: 'straight',
    };

    theme: ApexTheme = {
        mode: 'dark',
        palette: 'palette10',
    };

    series: ApexAxisChartSeries;
    title: ApexTitleSubtitle;
    xaxis: ApexXAxis;

    /**
     *
     * @param data Data points for the y-axis. e.g. calories eaten in a day
     * @param datetimes String version of dates for x-axis e.g. '2024-12-01'
     * @param yAxisTitle Name of the data on the y-axis e.g. 'calories'
     * @param title Title for the chart e.g. 'calories for <date>-<date>'
     */
    constructor(
        data: Array<number>,
        datetimes: Array<string>,
        yAxisTitle: string,
        title: string,
        annotationValue: number | undefined = undefined
    ) {
        this.title = {
            text: title,
            align: 'left',
            style: {
                fontSize: '16px',
                fontFamily: 'Roboto, sans-serif',
            },
        };

        this.series = [
            {
                name: yAxisTitle,
                data: data,
            },
        ];

        this.xaxis = {
            type: 'datetime',
            categories: [],
        };

        for (let index = 0; index < datetimes.length; index++) {
            (this.xaxis.categories as number[]).push(new Date(datetimes[index]).getTime());
        }

        if (annotationValue !== undefined) {
            this.annotations = {
                yaxis: [
                    {
                        y: annotationValue,
                        width: '100%',
                        label: {
                            text: 'goal',
                            position: 'left',
                            offsetX: -10,
                            style: {
                                background: '#fff',
                                color: '#777',
                                fontSize: '12px',
                                fontFamily: 'Roboto, sans-serif',
                                padding: {
                                    left: 5,
                                    right: 5,
                                    top: 3,
                                    bottom: 5,
                                },
                            },
                        },
                    },
                ],
            };
        }
    }
}
