import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { WeighInDTO } from '@models/weigh-in.model';
import { UnitConversionService } from '@services/unit-conversion.service';

@Component({
    selector: 'app-weighin-form',
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatMenuModule],
    templateUrl: './weighin-form.component.html',
    styleUrl: './weighin-form.component.css',
})
export class WeighinFormComponent {
    unitConversionService = inject(UnitConversionService);

    inputWeighIn = input.required<WeighInDTO>();
    outputWeighIn = output<WeighInDTO>();
    cancelSubmission = output<void>();

    private formBuilder = inject(NonNullableFormBuilder);
    weighInForm = this.formBuilder.group({
        weight: [0, [Validators.required]],
    });

    weightUnit = signal<string>('lb');

    selectUnit(unit: string) {
        const weight = this.weighInForm.controls.weight.value;
        const convertedWeight = this.unitConversionService.convert(weight).from(this.weightUnit()).to(unit);
        this.weightUnit.set(unit);
        this.weighInForm.controls.weight.setValue(+convertedWeight.toFixed(1));
    }

    onSubmit() {
        const weight = this.weighInForm.controls.weight.value;
        const convertedWeight = this.unitConversionService.convert(weight).from(this.weightUnit()).to('kg');

        const weighInOutput = new WeighInDTO();
        weighInOutput.weigh_in_date = this.inputWeighIn().weigh_in_date;
        weighInOutput.weight_kg = convertedWeight;
        this.outputWeighIn.emit(weighInOutput);
    }

    onCancel() {
        this.cancelSubmission.emit();
    }

    constructor() {
        effect(() => {
            const inputWeighIn = this.inputWeighIn();

            untracked(() => {
                const weight = this.unitConversionService.convert(inputWeighIn.weight_kg).from('kg').to('lb');
                this.weighInForm.controls.weight.setValue(+weight.toFixed(1));
            });
        });
    }
}
