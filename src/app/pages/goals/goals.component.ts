import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Goal } from '@models/goal.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';
import { UnitConversionService } from '@services/unit-conversion.service';

@Component({
    selector: 'app-page-goals',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
    ],
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.css',
})
export class GoalsComponent implements OnInit {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);
    unitConversionService = inject(UnitConversionService);

    private formBuilder = inject(NonNullableFormBuilder);
    goalForm = this.formBuilder.group({
        calories: [0, [Validators.required, Validators.min(0)]],
        fat: [0, Validators.min(0)],
        carbs: [0, Validators.min(0)],
        protein: [0, Validators.min(0)],
        cholesterol: [0, Validators.min(0)],
        fiber: [0, Validators.min(0)],
        sodium: [0, Validators.min(0)],
    });

    nutritionForm = this.formBuilder.group({
        weight: [0, [Validators.required, Validators.min(0)]],
        height: [0, [Validators.required, Validators.min(0)]],
        age: [0, [Validators.required, Validators.min(18)]],
        activityLevel: [1.0, [Validators.required, Validators.min(1.0)]],
        useMetric: [false, [Validators.required]],
    });

    useMetricSignal = toSignal(this.nutritionForm.controls.useMetric.valueChanges, {
        initialValue: this.nutritionForm.controls.useMetric.value,
    });

    weightUnit = signal<string>('lb');
    heightUnit = signal<string>('in');
    useMetric = signal<boolean>(false);

    async onSubmit() {
        const goal = new Goal(
            this.goalForm.controls.calories.value,
            this.goalForm.controls.fat.value,
            this.goalForm.controls.carbs.value,
            this.goalForm.controls.protein.value,
            this.goalForm.controls.cholesterol.value,
            this.goalForm.controls.fiber.value,
            this.goalForm.controls.sodium.value
        );
        await this.databaseService.setGoal(goal);
    }

    async ngOnInit() {
        const goal = await this.databaseService.getGoal();
        if (goal !== undefined) {
            this.goalForm.controls.calories.setValue(goal.calories);
            this.goalForm.controls.fat.setValue(goal.fat);
            this.goalForm.controls.carbs.setValue(goal.carbs);
            this.goalForm.controls.protein.setValue(goal.protein);
            this.goalForm.controls.cholesterol.setValue(goal.cholesterol);
            this.goalForm.controls.fiber.setValue(goal.fiber);
            this.goalForm.controls.sodium.setValue(goal.sodium);
        }
    }

    constructor() {
        this.dateService.setTitle('Goals');

        effect(() => {
            const useMetric = this.useMetricSignal();

            untracked(() => {
                const weightUnit = useMetric ? 'kg' : 'lb';
                const convertedWeight = this.unitConversionService
                    .convert(this.nutritionForm.controls.weight.value)
                    .from(this.weightUnit())
                    .to(weightUnit);
                this.weightUnit.set(weightUnit);

                const heightUnit = useMetric ? 'cm' : 'in';
                const convertedHeight = this.unitConversionService
                    .convert(this.nutritionForm.controls.height.value)
                    .from(this.heightUnit())
                    .to(heightUnit);
                this.heightUnit.set(heightUnit);

                this.nutritionForm.controls.weight.setValue(+convertedWeight.toFixed(1));
                this.nutritionForm.controls.height.setValue(+convertedHeight.toFixed(1));
            });
        });
    }
}
