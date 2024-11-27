import { Directive, HostListener, output } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appLongPress]',
})
export class LongPressDirective {
    longPress = output<MouseEvent>();
    private longPressTimeout: number | null = null;
    /**  Timeout in milliseconds */
    private readonly pressTime = 500;

    constructor() {}

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.longPressTimeout = window.setTimeout(() => {
            this.longPress.emit(event);
        }, this.pressTime);
    }

    @HostListener('mouseup', ['$event'])
    @HostListener('mouseleave', ['$event'])
    @HostListener('touchend', ['$event'])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMouseUp(_event: MouseEvent) {
        if (this.longPressTimeout !== null) {
            window.clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
    }
}
