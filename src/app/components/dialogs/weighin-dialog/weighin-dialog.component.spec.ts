import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeighInDialogComponent } from './weighin-dialog.component';

describe('WeighinDialogComponent', () => {
    let component: WeighInDialogComponent;
    let fixture: ComponentFixture<WeighInDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WeighInDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WeighInDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
