import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightPageComponent } from './weight.component';

describe('WeightComponent', () => {
    let component: WeightPageComponent;
    let fixture: ComponentFixture<WeightPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WeightPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WeightPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
