import { Directive, HostListener, output } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appLongPress]',
})
export class LongPressDirective {
    longPress = output<MouseEvent | TouchEvent>();

    /**  Timeout in milliseconds */
    private readonly pressTime = 500;
    /** Vertical distance that will cancel event emission */
    private readonly maxYScroll = 50;

    /** Reference to the timeout for the current longpress */
    private longPressTimeout: number | null = null;
    /** Used to track vertical distance change */
    private beginYCoord: number | null = null;

    constructor() {}

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    onMouseDown(event: MouseEvent | TouchEvent) {
        // This will stop this from hitting long press handlers on
        // parent comnponents
        event.stopPropagation();
        this.beginYCoord = this.getYPosition(event);

        this.longPressTimeout = window.setTimeout(() => {
            this.longPress.emit(event);
        }, this.pressTime);
    }

    @HostListener('mouseup', ['$event'])
    @HostListener('mouseleave', ['$event'])
    @HostListener('touchend', ['$event'])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMouseUp(_event: MouseEvent) {
        this.clearPress();
    }

    @HostListener('mousemove', ['$event'])
    @HostListener('touchmove', ['$event'])
    onMove(event: MouseEvent | TouchEvent) {
        if (this.longPressTimeout === null || this.beginYCoord === null) {
            return;
        }

        const currentY = this.getYPosition(event);
        // Check if vertical movement exceeds the threshold
        if (Math.abs(currentY - this.beginYCoord) > this.maxYScroll) {
            this.clearPress();
        }
    }

    private clearPress() {
        if (this.longPressTimeout !== null) {
            window.clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
        this.beginYCoord = null;
    }

    private getYPosition(event: MouseEvent | TouchEvent): number {
        if (event instanceof MouseEvent) {
            return event.clientY;
        } else {
            return event.touches[0].clientY;
        }
    }
}
