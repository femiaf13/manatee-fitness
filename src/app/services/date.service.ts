import { computed, Injectable, signal } from '@angular/core';
import { addDays, format } from 'date-fns';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    // This is how the date string needs to look before it hits the DB
    public static readonly DATE_FORMAT_STRING = 'yyyy-MM-dd';

    selectedDate = signal(new Date());
    selectedDateFormatted = computed(() => DateService.formateDate(this.selectedDate()));

    pageTitle = signal<string>('');

    constructor() {}

    /**
     * Sets the title for the application's top bar
     */
    public setTitle(title: string) {
        this.pageTitle.set(title);
    }

    /**
     * Sets the Date signal for the application
     */
    public setDate(newDate: Date) {
        this.selectedDate.set(newDate);
    }

    /**
     * Helper to make moving to tomorrow easier
     */
    public setTomorrow() {
        this.selectedDate.set(addDays(this.selectedDate(), 1));
    }

    /**
     * Helper to make moving to yesterday easier
     */
    public setYesterday() {
        this.selectedDate.set(addDays(this.selectedDate(), -1));
    }

    public static formateDate(date: Date): string {
        return format(date, DateService.DATE_FORMAT_STRING);
    }

    public static formatTime(time: string): string {
        const timeSplit = time.split(':');
        if (timeSplit.length !== 2) {
            return time;
        }
        let hours = Number(timeSplit[0]);
        const minutes = timeSplit[1];
        //it is pm if hours from 12 onwards
        const suffix = hours >= 12 ? 'pm' : 'am';
        //only -12 from hours if it is greater than 12 (if not back at mid night)
        hours = hours > 12 ? hours - 12 : hours;
        //if 00 then it is 12 am
        hours = hours === 0 ? 12 : hours;

        return `${hours}:${minutes} ${suffix}`;
    }
}
