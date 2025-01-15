import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
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
        MatTabsModule,
    ],
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.css',
})
export class GoalsComponent implements OnInit {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);
    snackBar = inject(MatSnackBar);
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

    caloriesSignal = toSignal(this.goalForm.controls.calories.valueChanges, {
        initialValue: this.goalForm.controls.calories.value,
    });

    /**
     * Calorie Stuff
     */
    readonly DANGEROUS_CALORIE_THRESHOLD = 1200;

    weightUnit = signal<string>('lb');
    heightUnit = signal<string>('in');

    nutritionForm = this.formBuilder.group({
        weight: [0, [Validators.required, Validators.min(25)]],
        height: [0, [Validators.required, Validators.min(10)]],
        age: [0, [Validators.required, Validators.min(18)]],
        activityLevel: [1.0, [Validators.required, Validators.min(1.0)]],
        isMale: [true, [Validators.required]],
        weightStrategy: [1.0, [Validators.required]],
        useMetric: [false, [Validators.required]],
    });

    nutritionFormSignal = toSignal(this.nutritionForm.valueChanges, { initialValue: this.nutritionForm.value });
    useMetricSignal = toSignal(this.nutritionForm.controls.useMetric.valueChanges, {
        initialValue: this.nutritionForm.controls.useMetric.value,
    });

    calculatedCalories = computed(() => {
        const formulaInputs = this.nutritionFormSignal();
        if (this.nutritionForm.valid) {
            // This is the Mifflin St Jeor equation from
            // https://en.wikipedia.org/wiki/Basal_metabolic_rate#BMR_estimation_formulas
            const convertedWeight = this.unitConversionService
                .convert(formulaInputs.weight)
                .from(this.weightUnit())
                .to('kg');

            const convertedHeight = this.unitConversionService
                .convert(formulaInputs.height)
                .from(this.heightUnit())
                .to('cm');

            let baseMetabolicRate = 10 * convertedWeight;
            baseMetabolicRate += 6.25 * convertedHeight;
            baseMetabolicRate -= 5 * (formulaInputs.age as number);
            if (formulaInputs.isMale === true) {
                baseMetabolicRate += 5;
            } else {
                baseMetabolicRate -= 161;
            }
            const maintenanceCalories = baseMetabolicRate * (formulaInputs.activityLevel as number);

            return +(maintenanceCalories * (formulaInputs.weightStrategy as number)).toFixed(0);
        }
        return 0;
    });

    /**
     * Macronutrient Stuff
     */
    readonly MINIMUM_FAT_PERCENTAGE = 20;
    readonly MINIMUM_CARBS_PERCENTAGE = 40;
    readonly MINIMUM_PROTEIN_PERCENTAGE = 10;
    // Defaults are sourced by being in the middle of generally
    // recommended ranges
    readonly DEFAULT_FAT_PERCENTAGE = 30;
    readonly DEFAULT_CARBS_PERCENTAGE = 50;
    readonly DEFAULT_PROTEIN_PERCENTAGE = 20;
    readonly CALORIES_PER_GRAM_FAT = 9;
    readonly CALORIES_PER_GRAM_CARBS = 4;
    readonly CALORIES_PER_GRAM_PROTEIN = 4;

    macrosForm = this.formBuilder.group({
        fatPercentage: [0, [Validators.required, Validators.min(this.MINIMUM_FAT_PERCENTAGE)]],
        carbsPercentage: [0, [Validators.required, Validators.min(this.MINIMUM_CARBS_PERCENTAGE)]],
        proteinPercentage: [0, [Validators.required, Validators.min(this.MINIMUM_PROTEIN_PERCENTAGE)]],
    });

    fatPercentageSignal = toSignal(this.macrosForm.controls.fatPercentage.valueChanges, {
        initialValue: this.macrosForm.controls.fatPercentage.value,
    });
    fatGrams = computed(() => {
        const fatPercentage = this.fatPercentageSignal() / 100;
        const calories = this.caloriesSignal();
        const fatGrams = (calories * fatPercentage) / this.CALORIES_PER_GRAM_FAT;
        return +fatGrams.toFixed(0);
    });

    carbsPercentageSignal = toSignal(this.macrosForm.controls.carbsPercentage.valueChanges, {
        initialValue: this.macrosForm.controls.carbsPercentage.value,
    });
    carbsGrams = computed(() => {
        const carbsPercentage = this.carbsPercentageSignal() / 100;
        const calories = this.caloriesSignal();
        const carbGrams = (calories * carbsPercentage) / this.CALORIES_PER_GRAM_CARBS;
        return +carbGrams.toFixed(0);
    });

    proteinPercentageSignal = toSignal(this.macrosForm.controls.proteinPercentage.valueChanges, {
        initialValue: this.macrosForm.controls.proteinPercentage.value,
    });
    proteinGrams = computed(() => {
        const proteinPercentage = this.proteinPercentageSignal() / 100;
        const calories = this.caloriesSignal();
        const proteinGrams = (calories * proteinPercentage) / this.CALORIES_PER_GRAM_PROTEIN;
        return +proteinGrams.toFixed(0);
    });

    /**
     *
     * @param message Notification message
     * @param action Text used for the dismissal button
     * @param duration Duration in ms before notification dismisses itself. Defaults to 5s
     */
    private openSnackBar(message: string, action: string = 'Dismiss', duration = 5000) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }

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
        this.openSnackBar('Goal entered!');
    }

    async onSubmitCalories() {
        const goalCalories = this.calculatedCalories();
        const goal = new Goal(
            goalCalories,
            this.goalForm.controls.fat.value,
            this.goalForm.controls.carbs.value,
            this.goalForm.controls.protein.value,
            this.goalForm.controls.cholesterol.value,
            this.goalForm.controls.fiber.value,
            this.goalForm.controls.sodium.value
        );
        await this.databaseService.setGoal(goal);
        this.goalForm.controls.calories.setValue(goalCalories);
        this.openSnackBar('Calories set!');
    }

    async onSubmitMacros() {
        const fatGrams = this.fatGrams();
        const carbsGrams = this.carbsGrams();
        const proteinGrams = this.proteinGrams();
        const goal = new Goal(
            this.goalForm.controls.calories.value,
            fatGrams,
            carbsGrams,
            proteinGrams,
            this.goalForm.controls.cholesterol.value,
            this.goalForm.controls.fiber.value,
            this.goalForm.controls.sodium.value
        );
        await this.databaseService.setGoal(goal);
        this.goalForm.controls.fat.setValue(fatGrams);
        this.goalForm.controls.carbs.setValue(carbsGrams);
        this.goalForm.controls.protein.setValue(proteinGrams);
        this.openSnackBar('Macros set!');
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
            // I need to do this to trigger the computed signals' initial computation
            // for some reason if I init the form with these values instead it won't get called
            this.macrosForm.controls.fatPercentage.setValue(30);
            this.macrosForm.controls.carbsPercentage.setValue(50);
            this.macrosForm.controls.proteinPercentage.setValue(20);
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
