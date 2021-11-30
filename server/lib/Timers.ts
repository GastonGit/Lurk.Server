import config from './settings/config.json';

export default class Timers {
    private updateTimer: NodeJS.Timer | undefined;

    private callMe;

    private constrainedIntervals: Array<NodeJS.Timer> = [];
    private constrainedEvents: Array<{ event: string; timer: number }> = [];

    private updateTimeInMinutes: number = config.updateTimeInMinutes * 60000;

    constructor(callMe: (event: string) => void) {
        this.callMe = callMe;
    }

    public startMainTimer(): void {
        this.startConstrainedIntervals();
        this.updateTimer = setInterval(async () => {
            this.endConstrainedIntervals();
            await this.callMe('main');
            this.startConstrainedIntervals();
        }, this.updateTimeInMinutes);
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
