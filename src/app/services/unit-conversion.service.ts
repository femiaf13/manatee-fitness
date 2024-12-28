import { Injectable } from '@angular/core';

import configureMeasurements from 'convert-units';
import allMeasures from 'convert-units/definitions/all';

@Injectable({
    providedIn: 'root',
})
export class UnitConversionService {
    convert = configureMeasurements(allMeasures);

    constructor() {}
}
