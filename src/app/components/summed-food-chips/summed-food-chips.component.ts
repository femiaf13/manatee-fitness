import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { SummedFood } from '@models/food.model';

@Component({
    selector: 'app-summed-food-chips',
    imports: [MatChipsModule],
    templateUrl: './summed-food-chips.component.html',
    styleUrl: './summed-food-chips.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummedFoodChipsComponent {
    summedFood = input.required<SummedFood>();
    summedCarbsRounded = computed(() => this.summedFood().carbs.toFixed(1));
    summedFatRounded = computed(() => this.summedFood().fat.toFixed(1));
    summedProteinRounded = computed(() => this.summedFood().protein.toFixed(1));
    summedCaloriesRounded = computed(() => this.summedFood().calories.toFixed(1));

    constructor() {}
}
