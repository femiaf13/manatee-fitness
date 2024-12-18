import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeDialogComponent } from './recipe-dialog.component';

describe('RecipeDialogComponent', () => {
    let component: RecipeDialogComponent;
    let fixture: ComponentFixture<RecipeDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecipeDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
