import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Food } from '@models/food.model';
import { DatabaseService } from '@services/database.service';

import { FoodListComponent } from '@components/food-list/food-list.component';

@Component({
    selector: 'app-page-food',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FoodListComponent,
    ],
    templateUrl: './food.component.html',
    styleUrl: './food.component.css',
})
export class FoodPageComponent implements OnInit {
    route = inject(ActivatedRoute);
    databaseService = inject(DatabaseService);
    searchText = new FormControl('', { nonNullable: true });
    foods = toSignal(
        this.searchText.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchTerm => this.search(searchTerm))
        ),
        { initialValue: [] as Food[] }
    );
    /**
     * Optional input parameter telling us if we're looking for food for a specific meal
     */
    mealId: number | undefined = undefined;

    async search(searchTerm: string): Promise<Array<Food>> {
        return await this.databaseService.getFoodsBySearch(searchTerm);
    }

    constructor() {}

    ngOnInit(): void {
        const mealIdParam: string | undefined = this.route.snapshot.queryParams['meal'];
        if (mealIdParam) {
            this.mealId = Number(mealIdParam);
        }
    }
}
