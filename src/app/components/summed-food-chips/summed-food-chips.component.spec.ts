import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummedFoodChipsComponent } from './summed-food-chips.component';

describe('SummedFoodChipsComponent', () => {
    let component: SummedFoodChipsComponent;
    let fixture: ComponentFixture<SummedFoodChipsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SummedFoodChipsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SummedFoodChipsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
