import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WeighinFormComponent } from '@components/forms/weighin-form/weighin-form.component';
import { WeighInDTO } from '@models/weigh-in.model';

export interface WeighInDialogData {
    modify: boolean;
    weighIn: WeighInDTO;
}

@Component({
    selector: 'app-weighin-dialog',
    imports: [MatDialogTitle, MatDialogContent, WeighinFormComponent],
    templateUrl: './weighin-dialog.component.html',
    styleUrl: './weighin-dialog.component.css',
})
export class WeighInDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<WeighInDialogData>(MAT_DIALOG_DATA);

    onSubmit(weighIn: WeighInDTO) {
        this.dialog.close(weighIn);
    }

    onCancel() {
        this.dialog.close(undefined);
    }

    constructor() {}
}
