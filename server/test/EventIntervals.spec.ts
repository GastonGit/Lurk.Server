import { expect } from 'chai';
import { afterEach } from 'mocha';
import EventIntervals from '../lib/EventIntervals';

const callMe = (_event: string) => {
    return _event;
};
const eventIntervals = new EventIntervals(callMe);

describe('EventIntervals suite', () => {
    describe('Super interval', () => {
        it('superInterval should call given method with correct event', (done) => {
            let callMeEvent = false;
            const callMe = (_event: string) => {
                callMeEvent = _event === 'test1';
            };
            const innerEventIntervals = new EventIntervals(callMe);

            innerEventIntervals.startSuperInterval('test1', 1);

            const checkExpect = function () {
                innerEventIntervals.endAllIntervals();
                expect(callMeEvent).to.be.true;
                done();
            };

            setTimeout(checkExpect, 10);
        });
        it('superInterval should throw if called twice without being cleared', () => {
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
        it('should not throw', () => {
            expect(() => {
                eventIntervals.createConstrainedInterval('test', 1);
            }).to.not.throw();
        });
        it('should all call given method', (done) => {
            expect(() => {
                let CI1 = false;
                let CI2 = false;
                let CI3 = false;
                const callMe = (_event: string) => {
                    switch (_event) {
                        case 'CI1':
                            CI1 = true;
                            break;
                        case 'CI2':
                            CI2 = true;
                            break;
                        case 'CI3':
                            CI3 = true;
                            break;
                    }
                };
                const innerEventIntervals = new EventIntervals(callMe);

                innerEventIntervals.startSuperInterval('test1', 1);

                innerEventIntervals.createConstrainedInterval('CI1', 0);
                innerEventIntervals.createConstrainedInterval('CI2', 0);
                innerEventIntervals.createConstrainedInterval('CI3', 0);

                const checkExpect = function () {
                    innerEventIntervals.endAllIntervals();
                    expect(CI1 && CI2 && CI3).to.be.true;
                    done();
                };

                setTimeout(checkExpect, 35);
            }).to.not.throw();
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
        it('should all call given method', (done) => {
            expect(() => {
                let callMeEvent = false;
                const callMe = (_event: string) => {
                    callMeEvent = _event === 'testIndependent';
                };
                const innerEventIntervals = new EventIntervals(callMe);

                innerEventIntervals.startIndependentInterval(
                    'testIndependent',
                    1,
                );

                const checkExpect = function () {
                    innerEventIntervals.endIndependentInterval(
                        'testIndependent',
                    );
                    expect(callMeEvent).to.be.true;
                    done();
                };

                setTimeout(checkExpect, 20);
            }).to.not.throw();
        });
    });
    afterEach(() => {
        eventIntervals.endAllIntervals();
    });
});
