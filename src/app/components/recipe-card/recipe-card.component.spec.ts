import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCardComponent } from './recipe-card.component';

describe('RecipeCardComponent', () => {
    let component: RecipeCardComponent;
    let fixture: ComponentFixture<RecipeCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecipeCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipeCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
