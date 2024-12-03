import { Component, computed, inject, output } from '@angular/core';
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
    imports: [MatButtonModule, MatDatepickerModule, MatIconModule, MatMenuModule, MatToolbarModule],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
    toggleSideNav = output<boolean>();
    dateService = inject(DateService);

    dateString = computed(() => {
        return this.dateService.selectedDate().toDateString();
    });

    // TODO: Clicking date opens dialog datepicker to change date
    openDatepicker() {
        console.log('TODO');
    }
}
