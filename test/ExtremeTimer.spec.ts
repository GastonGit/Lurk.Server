import { expect } from 'chai';
import ExtremeTimer from '../lib/ExtremeTimer';

describe('ExtremeTimer suite', () => {
    describe('Timeout', () => {
        it('should resolve', () => {
            expect(ExtremeTimer.timeOut(0)).to.not.rejectedWith();
        });
    });
});
