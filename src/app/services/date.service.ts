import { computed, Injectable, signal } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
    providedIn: 'root'
})
export class DateService {
    selectedDate = signal(new Date())
    selectedDateFormatted = computed(() => format(this.selectedDate(), "yyyy-MM-dd"));

    constructor() { }

    /**
     * set
     * 
     * Sets the Date signal for the application
     */
    public set(newDate: Date) {
        this.selectedDate.set(newDate);
    }
}
