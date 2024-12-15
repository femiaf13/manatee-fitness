import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesComponent } from './recipes.component';

describe('RecipesComponent', () => {
    let component: RecipesComponent;
    let fixture: ComponentFixture<RecipesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecipesComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
