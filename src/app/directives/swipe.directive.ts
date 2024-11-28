import { Directive, HostListener, output } from '@angular/core';

@Directive({
    selector: '[appSwipe]',
    standalone: true,
})
export class SwipeDirective {
    // @Output() next = new EventEmitter<void>();
    swipeNext = output<void>();
    // @Output() previous = new EventEmitter<void>();
    swipePrevious = output<void>();

    swipeCoord = [0, 0];
    swipeTime = new Date().getTime();

    constructor() {}

    @HostListener('touchstart', ['$event'])
    onSwipeStart(event: TouchEvent) {
        this.swipe(event, 'start');
    }

    @HostListener('touchend', ['$event'])
    @HostListener('touchcancel', ['$event'])
    onSwipeEnd(event: TouchEvent) {
        this.swipe(event, 'end');
    }

    swipe(event: TouchEvent, when: string): void {
        const coord: [number, number] = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
        // const coord: [number, number] = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
        const time = new Date().getTime();

        if (when === 'start') {
            this.swipeCoord = coord;
            this.swipeTime = time;
        } else if (when === 'end') {
            const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
            const duration = time - this.swipeTime;

            if (
                duration < 1000 && // Gesture was less than 1 second
                Math.abs(direction[0]) > 30 &&
                Math.abs(direction[0]) > Math.abs(direction[1] * 3)
            ) {
                // Horizontal enough
                const swipeDir = direction[0] < 0 ? 'next' : 'previous';
                if (swipeDir === 'next') {
                    this.swipeNext.emit();
                } else {
                    this.swipePrevious.emit();
                }
            }
        }
    }
}
