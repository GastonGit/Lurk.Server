export default class EventIntervals {
    private superInterval: NodeJS.Timer | undefined;
    private constrainedIntervals: Array<NodeJS.Timer> = [];
    private constrainedEvents: Array<{ callback: () => void; timer: number }> =
        [];
    private independentEvents: Array<{
        name: string;
        interval: NodeJS.Timer;
    }> = [];

    public createConstrainedInterval(
        callback: () => void,
        timer: number,
    ): void {
        this.constrainedEvents.push({ callback: callback, timer: timer });
    }

    public startSuperInterval(callback: () => void, timer: number): void {
        if (typeof this.superInterval === 'undefined') {
            this.startConstrainedIntervals();
            this.superInterval = setInterval(async () => {
                this.clearAllConstrainedIntervals();
                await callback();
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
                    this.constrainedEvents[i].callback();
                }, this.constrainedEvents[i].timer),
            );
        }
    }

    public startIndependentInterval(
        name: string,
        callback: () => void,
        timer: number,
    ): void {
        this.independentEvents.push({
            name: name,
            interval: setInterval(async () => {
                await callback();
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

    public clearIndependentInterval(name: string): void {
        const found = this.independentEvents.find(
            (independentEvent) => independentEvent.name === name,
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
