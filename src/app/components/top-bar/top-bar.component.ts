import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DateService } from '@services/date.service';

@Component({
    selector: 'app-top-bar',
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
    dateService = inject(DateService);

    dateString = computed(() => {
        return this.dateService.selectedDate().toDateString();
    });
}
