import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsComponent } from './goals.component';

describe('GoalsComponent', () => {
    let component: GoalsComponent;
    let fixture: ComponentFixture<GoalsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GoalsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GoalsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
