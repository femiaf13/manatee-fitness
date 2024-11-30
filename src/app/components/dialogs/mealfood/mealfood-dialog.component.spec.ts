import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealfoodDialogComponent } from './mealfood-dialog.component';

describe('MealfoodDialogComponent', () => {
    let component: MealfoodDialogComponent;
    let fixture: ComponentFixture<MealfoodDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MealfoodDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MealfoodDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
