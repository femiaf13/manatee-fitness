import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DateService } from '@services/date.service';

@Component({
    selector: 'app-page-weight',
    imports: [],
    templateUrl: './weight.component.html',
    styleUrl: './weight.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightPageComponent {
    dateService = inject(DateService);

    constructor() {
        this.dateService.setTitle('Weight');
    }
}
