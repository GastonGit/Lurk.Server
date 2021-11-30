export default class EventIntervals {
    private callMe;

    private constrainedIntervals: Array<NodeJS.Timer> = [];
    private constrainedEvents: Array<{ event: string; timer: number }> = [];

    private superIntervals: Array<NodeJS.Timer> = [];

    constructor(callMe: (event: string) => void) {
        this.callMe = callMe;
    }

    public startSuperInterval(event: string, timer: number): void {
        this.superIntervals.push(
            setInterval(() => {
                this.endConstrainedIntervals();
                this.callMe(event);
                this.startConstrainedIntervals();
            }, timer),
        );
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
}
