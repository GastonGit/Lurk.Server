import { expect } from 'chai';
import sinon from 'sinon';
import Logger from '../lib/Logger';

describe('Logger suite', () => {
    before(() => {
        sinon.stub(console, 'log');
        sinon.stub(console, 'info');
        sinon.stub(console, 'warn');
        sinon.stub(console, 'error');
    });
    describe('Calling methods with proper arguments', () => {
        it('should not throw', () => {
            expect(() => {
                Logger.special('test', 'test', 'test');
            }).to.not.throw();
            expect(() => {
                Logger.error('test', 'test', 'test');
            }).to.not.throw();
            expect(() => {
                Logger.info('test', 'test');
            }).to.not.throw();
            expect(() => {
                Logger.success('test', 'test');
            }).to.not.throw();
            expect(() => {
                Logger.failure('test', 'test', 'test');
            }).to.not.throw();
        });
    });
});
