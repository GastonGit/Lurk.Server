import { expect } from 'chai';
import sinon from 'sinon';
import Logger from '../lib/Logger';

describe('Logger suite', function () {
    before(function () {
        sinon.stub(console, 'log');
        sinon.stub(console, 'info');
        sinon.stub(console, 'warn');
        sinon.stub(console, 'error');
    });
    describe('Calling methods with proper arguments', function () {
        it('should not throw', function () {
            expect(function () {
                Logger.special('test', 'test', 'test');
            }).to.not.throw();
            expect(function () {
                Logger.error('test', 'test', 'test');
            }).to.not.throw();
            expect(function () {
                Logger.info('test', 'test');
            }).to.not.throw();
            expect(function () {
                Logger.success('test', 'test');
            }).to.not.throw();
            expect(function () {
                Logger.failure('test', 'test', 'test');
            }).to.not.throw();
        });
    });
});
