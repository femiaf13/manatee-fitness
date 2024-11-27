import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateService } from '@services/date.service';

@Component({
    selector: 'app-top-bar',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [MatButtonModule, MatDatepickerModule, MatIconModule, MatMenuModule, MatToolbarModule, RouterLink],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
    dateService = inject(DateService);

    dateString = computed(() => {
        return this.dateService.selectedDate().toDateString();
    });

    // TODO: Clicking date opens dialog datepicker to change date
    openDatepicker() {
        console.log('TODO');
    }
}
