import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipefoodDialogComponent } from './recipefood-dialog.component';

describe('RecipefoodDialogComponent', () => {
    let component: RecipefoodDialogComponent;
    let fixture: ComponentFixture<RecipefoodDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecipefoodDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipefoodDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
