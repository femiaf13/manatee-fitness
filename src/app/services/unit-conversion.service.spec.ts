import { TestBed } from '@angular/core/testing';

import { UnitConversionService } from './unit-conversion.service';

describe('UnitConversionService', () => {
    let service: UnitConversionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UnitConversionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
