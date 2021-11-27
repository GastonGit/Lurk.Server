import config from './settings/config.json';

export default class Timers {
    private checkTimer: NodeJS.Timer | undefined;
    private reduceTimer: NodeJS.Timer | undefined;
    private updateTimer: NodeJS.Timer | undefined;

    private mainRoutine;
    private hitChecker;
    private reducer;

    private updateTimeInMinutes: number = config.updateTimeInMinutes * 60000;

    private spikeValue: number = config.spikeValue;
    private spikeTime: number = config.spikeTime;
    private reduceValue: number = config.reduceValue;
    private reduceTime: number = config.reduceTime;

    constructor(
        mainRoutine: () => Promise<boolean>,
        hitChecker: (spikeValue: number) => void,
        reducer: (reduceValue: number) => void,
    ) {
        this.mainRoutine = mainRoutine;
        this.hitChecker = hitChecker;
        this.reducer = reducer;
    }

    public startMainTimer(): void {
        this.startMonitorTimers();
        this.updateTimer = setInterval(async () => {
            this.endAllMonitorTimers();
            await this.mainRoutine();
            this.startMonitorTimers();
        }, this.updateTimeInMinutes);
    }

    private startMonitorTimers(): void {
        this.checkTimer = setInterval(() => {
            this.hitChecker(this.spikeValue);
        }, this.spikeTime);
        this.reduceTimer = setInterval(() => {
            this.reducer(this.reduceValue);
        }, this.reduceTime);
    }

    private endAllMonitorTimers(): void {
        clearInterval(<NodeJS.Timeout>this.checkTimer);
        clearInterval(<NodeJS.Timeout>this.reduceTimer);
    }
}
