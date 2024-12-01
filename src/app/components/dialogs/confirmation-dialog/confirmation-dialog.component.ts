import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
    title: string;
    content: string;
    action: string;
}

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent {
    dialog = inject(MatDialogRef);
    data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
}
