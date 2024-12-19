import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipefoodFormComponent } from './recipefood-form.component';

describe('RecipefoodFormComponent', () => {
    let component: RecipefoodFormComponent;
    let fixture: ComponentFixture<RecipefoodFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecipefoodFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipefoodFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
