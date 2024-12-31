import { ApexChart, ApexMarkers, ApexStroke } from 'ng-apexcharts';

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

    // These colors are pulled from node_modules/@angular/material/prebuilt-themes/purple-green.css
    colors: Array<string> = ['#7b1fa2', '#69f0ae', '#f44336'];

    dataLabels: ApexDataLabels = {
        enabled: false,
    };

    markers: ApexMarkers = {
        // How to alternate markers if that's ever needed?
        // size: [2, 0],
        size: 0,
    };

    stroke: ApexStroke = {
        curve: 'straight',
        width: [2, 5],
    };

    theme: ApexTheme = {
        mode: 'dark',
        palette: 'palette10',
    };

    yaxis: ApexYAxis = {
        show: true,
    };

    series: ApexAxisChartSeries;
    title: ApexTitleSubtitle;
    xaxis: ApexXAxis;

    /**
     *
     * @param data Arrays of data series for the y-axis. e.g. calories eaten in a day
     * @param datetimes String version of dates for x-axis e.g. '2024-12-01'
     * @param yAxisTitles Names of the data on the y-axis e.g. 'calories'
     * @param title Title for the chart e.g. 'calories for <date>-<date>'
     */
    constructor(
        data: Array<number[]>,
        datetimes: Array<string>,
        yAxisTitles: Array<string>,
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

        this.series = [];

        for (let i = 0; i < data.length; i++) {
            const dataSet = data[i];
            const yAxisTitle = yAxisTitles[i];
            this.series.push({
                name: yAxisTitle,
                data: dataSet,
            });
        }

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
