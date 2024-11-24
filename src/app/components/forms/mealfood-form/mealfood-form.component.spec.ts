import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealfoodFormComponent } from './mealfood-form.component';

describe('MealfoodFormComponent', () => {
    let component: MealfoodFormComponent;
    let fixture: ComponentFixture<MealfoodFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MealfoodFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MealfoodFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
