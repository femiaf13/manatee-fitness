import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { Goal } from '@models/goal.model';
import { DatabaseService } from '@services/database.service';
import { DateService } from '@services/date.service';

@Component({
    selector: 'app-page-goals',
    imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatGridListModule, MatInputModule],
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.css',
})
export class GoalsComponent implements OnInit {
    dateService = inject(DateService);
    databaseService = inject(DatabaseService);

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
    }
}
