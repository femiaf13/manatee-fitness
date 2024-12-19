import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Recipe } from '@models/recipe.model';

@Component({
    selector: 'app-recipe-form',
    imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
    templateUrl: './recipe-form.component.html',
    styleUrl: './recipe-form.component.css',
})
export class RecipeFormComponent {
    inputRecipe = input<Recipe>(new Recipe());
    outputRecipe = output<string>();
    cancelSubmission = output<void>();

    private formBuilder = inject(NonNullableFormBuilder);
    recipeForm = this.formBuilder.group({
        recipeName: ['', [Validators.required]],
    });

    constructor() {
        effect(() => {
            const inputRecipe = this.inputRecipe();

            // When editing a recipe load the existing data
            untracked(() => {
                this.recipeForm.controls.recipeName.setValue(inputRecipe.recipe_name);
            });
        });
    }

    onSubmit() {
        const rawFormValues = this.recipeForm.getRawValue();
        this.outputRecipe.emit(rawFormValues.recipeName);
    }

    onCancel() {
        this.cancelSubmission.emit();
    }
}
