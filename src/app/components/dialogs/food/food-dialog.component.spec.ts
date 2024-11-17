import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodDialogComponent } from './food-dialog.component';

describe('FoodDialogComponent', () => {
    let component: FoodDialogComponent;
    let fixture: ComponentFixture<FoodDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FoodDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FoodDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
