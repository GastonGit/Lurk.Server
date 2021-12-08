import { expect } from 'chai';
import { afterEach } from 'mocha';
import sinon from 'sinon';
import EventIntervals from '../lib/EventIntervals';

let eventIntervals: EventIntervals;
let clock: sinon.SinonFakeTimers;

describe('EventIntervals suite', () => {
    beforeEach(() => {
        clock = sinon.useFakeTimers();
        eventIntervals = new EventIntervals();
    });
    afterEach(() => {
        eventIntervals.clearAllIntervals();
        sinon.restore();
    });
    describe('startSuperInterval', () => {
        it('should call given method', () => {
            const spy = sinon.spy(() => {
                // do nothing
            });
            eventIntervals.startSuperInterval(spy, 10);
            clock.tick(100);

            sinon.assert.called(spy);
        });
        it('should throw if called twice without being cleared', () => {
            expect(() => {
                eventIntervals.startSuperInterval(() => {
                    // do nothing
                }, 0);
                eventIntervals.startSuperInterval(() => {
                    // also do nothing
                }, 0);
            }).to.throw();

            eventIntervals.clearSuperInterval();
            expect(() => {
                eventIntervals.startSuperInterval(() => {
                    // do nothing
                }, 0);
                eventIntervals.clearSuperInterval();
                eventIntervals.startSuperInterval(() => {
                    // do nothing again
                }, 0);
            }).to.not.throw();
        });
    });
    describe('Constrained Intervals', () => {
        it('should be started when SuperInterval is started', () => {
            const spy = sinon.spy(() => {
                // do nothing
            });
            eventIntervals.createConstrainedInterval(spy, 20);
            eventIntervals.startSuperInterval(() => {
                // do nothing but super
            }, 100);
            clock.tick(1000);

            sinon.assert.called(spy);
        });
        it('should all call given method', () => {
            const spy1 = sinon.spy(() => {
                // do nothing 1
            });
            const spy2 = sinon.spy(() => {
                // do nothing 2
            });
            const spy3 = sinon.spy(() => {
                // do nothing 3
            });

            eventIntervals.createConstrainedInterval(spy1, 20);
            eventIntervals.createConstrainedInterval(spy2, 30);
            eventIntervals.createConstrainedInterval(spy3, 40);

            eventIntervals.startSuperInterval(() => {
                // do nothing super
            }, 50);

            clock.tick(1000);

            sinon.assert.called(spy1);
            sinon.assert.called(spy2);
            sinon.assert.called(spy3);
        });
    });
    describe('Independent Intervals', () => {
        it('should not throw if trying to clear an interval that does not exist', () => {
            expect(() => {
                eventIntervals.clearIndependentInterval('test');
            }).to.not.throw();
        });
        it('should not throw when started and cleared', () => {
            expect(() => {
                eventIntervals.startIndependentInterval(
                    'test',
                    () => {
                        // do nothing
                    },
                    0,
                );
                eventIntervals.clearIndependentInterval('test');
            }).to.not.throw();
        });
        it('should call given method', () => {
            const spy = sinon.spy(() => {
                // do nothing
            });
            eventIntervals.startIndependentInterval('testIndependent', spy, 50);
            clock.tick(1000);

            sinon.assert.called(spy);
        });
    });
});
