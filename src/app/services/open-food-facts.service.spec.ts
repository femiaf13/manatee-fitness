import { TestBed } from '@angular/core/testing';

import { OpenFoodFactsService } from './open-food-facts.service';

describe('OpenFoodFactsService', () => {
    let service: OpenFoodFactsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenFoodFactsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
