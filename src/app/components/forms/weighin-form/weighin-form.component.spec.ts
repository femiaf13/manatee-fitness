import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeighinFormComponent } from './weighin-form.component';

describe('WeighinFormComponent', () => {
    let component: WeighinFormComponent;
    let fixture: ComponentFixture<WeighinFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WeighinFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WeighinFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
