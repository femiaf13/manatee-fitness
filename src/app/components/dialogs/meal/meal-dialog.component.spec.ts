import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealDialogComponent } from './meal-dialog.component';

describe('MealComponent', () => {
    let component: MealDialogComponent;
    let fixture: ComponentFixture<MealDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MealDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MealDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
