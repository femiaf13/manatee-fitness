import { computed, Injectable, signal } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    // This is how the date string needs to look before it hits the DB
    public static readonly DATE_FORMAT_STRING = 'yyyy-MM-dd';

    selectedDate = signal(new Date());
    selectedDateFormatted = computed(() => format(this.selectedDate(), DateService.DATE_FORMAT_STRING));

    constructor() {}

    /**
     * Sets the Date signal for the application
     */
    public set(newDate: Date) {
        this.selectedDate.set(newDate);
    }
}
