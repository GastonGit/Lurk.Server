export default class EventIntervals {
    private readonly callMe: { (arg0: string): void; (event: string): void };
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

    public createConstrainedInterval(event: string, timer: number): void {
        this.constrainedEvents.push({ event: event, timer: timer });
    }

    public startSuperInterval(event: string, timer: number): void {
        if (typeof this.superInterval === 'undefined') {
            this.startConstrainedIntervals();
            this.superInterval = setInterval(() => {
                this.clearAllConstrainedIntervals();
                this.callMe(event);
                this.startConstrainedIntervals();
            }, timer);
        } else {
            throw Error(
                'startSuperInterval - Only one super interval is allowed - superInterval is not undefined',
            );
        }
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

    public startIndependentInterval(event: string, timer: number): void {
        this.independentEvents.push({
            event: event,
            interval: setInterval(() => {
                this.callMe(event);
            }, timer),
        });
    }

    public clearAllIntervals(): void {
        this.clearSuperInterval();
        this.clearAllConstrainedIntervals();
        this.clearAllIndependentIntervals();
    }

    public clearSuperInterval(): void {
        clearInterval(<NodeJS.Timeout>this.superInterval);
        this.superInterval = undefined;
    }

    private clearAllConstrainedIntervals(): void {
        for (let i = 0; i < this.constrainedIntervals.length; i++) {
            clearInterval(this.constrainedIntervals[i]);
        }
        this.constrainedIntervals = [];
    }

    public clearIndependentInterval(event: string): void {
        const found = this.independentEvents.find(
            (independentEvent) => independentEvent.event === event,
        );

        if (typeof found !== 'undefined') {
            clearInterval(found.interval);
        }
    }

    public clearAllIndependentIntervals(): void {
        for (let i = 0; i < this.independentEvents.length; i++) {
            clearInterval(this.independentEvents[i].interval);
        }
        this.independentEvents = [];
    }
}
