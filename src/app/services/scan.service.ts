import { Injectable } from '@angular/core';
import { checkPermissions, requestPermissions, cancel, Format, scan } from '@tauri-apps/plugin-barcode-scanner';

@Injectable({
    providedIn: 'root',
})
export class ScanService {
    /** Time in milliseconds we allow the camera to be open before closing it */
    readonly MAX_SCAN_DURATION_MS = 10000;
    constructor() {}

    public async scan(): Promise<string> {
        let scanResult = '';
        const permission = await checkPermissions();
        if (permission !== 'granted') {
            if ((await requestPermissions()) !== 'granted') {
                return scanResult;
            }
        }
        // Close the scanner after 10 seconds
        let scanTimeout: number | null = window.setTimeout(() => {
            scanTimeout = null;
            cancel();
        }, this.MAX_SCAN_DURATION_MS);
        const tempScanResult = await scan({
            windowed: false,
            formats: [Format.EAN13, Format.EAN8, Format.UPC_A, Format.UPC_E],
        });
        if (scanTimeout) {
            clearTimeout(scanTimeout);
            scanResult = tempScanResult.content;
        }
        return scanResult;
    }
}
