import Logger from './Logger';

export default class EventIntervals {
    private readonly callMe;
    private superInterval: NodeJS.Timer | undefined;
    private constrainedIntervals: Array<NodeJS.Timer> = [];
    private constrainedEvents: Array<{ event: string; timer: number }> = [];
    private independentEvents: Array<{
        event: string;
        interval: NodeJS.Timer;
    }> = [];

    constructor(callMe: (event: string) => void) {
        this.callMe = callMe;
    }

    public startSuperInterval(event: string, timer: number): void {
        if (typeof this.superInterval === 'undefined') {
            this.superInterval = setInterval(() => {
                this.endConstrainedIntervals();
                this.callMe(event);
                this.startConstrainedIntervals();
            }, timer);
        } else {
            Logger.error(
                'startSuperInterval',
                'Only one super interval is allowed',
                'startSuperInterval called but superInterval is not undefined',
            );
        }
    }

    public createConstrainedInterval(event: string, timer: number): void {
        this.constrainedEvents.push({ event: event, timer: timer });
    }

    private startConstrainedIntervals(): void {
        for (let i = 0; i < this.constrainedEvents.length; i++) {
            this.constrainedIntervals.push(
                setInterval(() => {
                    this.callMe(this.constrainedEvents[i].event);
                }, this.constrainedEvents[i].timer),
            );
        }
    }

    private endConstrainedIntervals(): void {
        for (let i = 0; i < this.constrainedIntervals.length; i++) {
            clearInterval(this.constrainedIntervals[i]);
        }
        this.constrainedIntervals = [];
    }

    public startIndependentInterval(event: string, timer: number): void {
        this.independentEvents.push({
            event: event,
            interval: setInterval(() => {
                this.callMe(event);
            }, timer),
        });
    }

    public endIndependentInterval(event: string): void {
        const found = this.independentEvents.find(
            (independentEvent) => independentEvent.event === event,
        );

        if (typeof found !== 'undefined') {
            clearInterval(found.interval);
        }
    }

    public endAllIndependentIntervals(): void {
        for (let i = 0; i < this.independentEvents.length; i++) {
            clearInterval(this.independentEvents[i].interval);
        }
        this.independentEvents = [];
    }
}
