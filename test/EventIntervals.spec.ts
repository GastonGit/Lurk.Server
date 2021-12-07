import { expect } from 'chai';
import { afterEach } from 'mocha';
import sinon from 'sinon';
import EventIntervals from '../lib/EventIntervals';

let eventResult: string[];
const callMe = (event: string) => {
    eventResult.push(event);
};
let eventIntervals: EventIntervals;
let clock: sinon.SinonFakeTimers;

describe('EventIntervals suite', () => {
    beforeEach(() => {
        clock = sinon.useFakeTimers();
        eventResult = [];
        eventIntervals = new EventIntervals(callMe);
    });
    afterEach(() => {
        eventIntervals.endAllIntervals();
        sinon.restore();
    });
    describe('startSuperInterval', () => {
        it('should call given method with correct event', () => {
            eventIntervals.startSuperInterval('test123', 10);
            clock.tick(100);

            expect(eventResult).to.include('test123');
        });
        it('should throw if called twice without being cleared', () => {
            expect(() => {
                eventIntervals.startSuperInterval('test1', 0);
                eventIntervals.startSuperInterval('test2', 0);
            }).to.throw();

            eventIntervals.endSuperInterval();
            expect(() => {
                eventIntervals.startSuperInterval('test3', 0);
                eventIntervals.endSuperInterval();
                eventIntervals.startSuperInterval('test4', 0);
            }).to.not.throw();
        });
    });
    describe('Constrained Intervals', () => {
        it('should be started when SuperInterval is started', () => {
            eventIntervals.createConstrainedInterval('CI1', 20);
            eventIntervals.startSuperInterval('test1', 100);
            clock.tick(1000);

            expect(eventResult).to.include('CI1');
        });
        it('should all call given method', () => {
            eventIntervals.createConstrainedInterval('CI1', 20);
            eventIntervals.createConstrainedInterval('CI2', 30);
            eventIntervals.createConstrainedInterval('CI3', 40);
            eventIntervals.startSuperInterval('test123', 50);

            clock.tick(1000);

            expect(eventResult).to.include.members(['CI1', 'CI2', 'CI3']);
        });
    });
    describe('Independent Intervals', () => {
        it('should not throw if trying to clear an interval that does not exist', () => {
            expect(() => {
                eventIntervals.endIndependentInterval('test');
            }).to.not.throw();
        });
        it('should not throw when started and cleared', () => {
            expect(() => {
                eventIntervals.startIndependentInterval('test', 0);
                eventIntervals.endIndependentInterval('test');
            }).to.not.throw();
        });
        it('should call given method', () => {
            eventIntervals.startIndependentInterval('testIndependent', 50);
            clock.tick(1000);

            expect(eventResult).to.include('testIndependent');
        });
    });
});
