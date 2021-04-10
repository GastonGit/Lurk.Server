const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;

const proxyquire = require('proxyquire');
const fetchStub = require('../stubs/fetchStub');

let ClipperClass = proxyquire('../lib/Clipper',{'node-fetch':fetchStub});
let Clipper

describe('Clipper methods', function() {
    before(function (){
        Clipper = new ClipperClass();
    })
    describe('Get clip', function() {
        it('should throw without an argument', function() {
            expect(Clipper.getClip).to.throw();
        });
        it('should return an object', function() {
            expect(Clipper.getClip("KappaPogChamp")).to.be.an('object');
        });
    });
    describe('Create clip', function() {
        it('should take a string argument', async function() {
            await expect(Clipper.createClip()).to.be.rejectedWith('Argument is undefined');
            await expect(Clipper.createClip(123)).to.be.rejectedWith('Argument is not a string');
            await expect(Clipper.createClip('moonmoon')).to.be.fulfilled;
        });
        it('should return a a twitch clip url as a string', async function() {
            const result = await Clipper.createClip("MoonMoon");
            expect(result).to.be.an('string');
            expect(result).to.equal('https://clips.twitch.tv/EphemeralClumsyCatKAPOW-SzCaOix1-olnn42x');
        });
        it('should return a string when NODE_ENV is set to test_values', async function() {
            process.env.NODE_ENV='test_values';
            const result = await Clipper.createClip("MoonMoon");
            expect(result).to.be.an('string');
            delete process.env.NODE_ENV;
        });
    });
    describe('getBroadcasterID', function() {
        it('should throw if not supplied with a defined argument', async function() {
            await expect(Clipper.getBroadcasterID()).to.be.rejected
            await expect(Clipper.getBroadcasterID()).to.be.rejectedWith("Argument is undefined");
        });
        it('should return a twitch users broadcaster id as a string', async function() {
            const result = await Clipper.getBroadcasterID("moonmoon");
            expect(result).to.be.a('string');
            expect(parseInt(result)).to.equal(121059319)
        });
        it('should return a twitch users broadcaster id as a string', async function() {
            const result = await Clipper.getBroadcasterID("moonmoon");
            expect(result).to.be.a('string');
            expect(parseInt(result)).to.equal(121059319)
        });
    });
    describe('getUser', function() {
        it('should throw if not supplied with a defined argument', async function() {
            await expect(Clipper.getUser()).to.be.rejected
            await expect(Clipper.getUser()).to.be.rejectedWith("Argument is undefined");
        });
        it('should throw if status code is not 200', async function() {
            const fetchStubInner = function(url){
                if (url.includes('users?')){
                    return Promise.resolve({
                        status: 401
                    })
                } else {
                    const result = {"access_token": "j9b1e59"}
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                }
            };
            let ClipperClassInner = proxyquire('../lib/Clipper',{'node-fetch':fetchStubInner});
            let ClipperInner = new ClipperClassInner();

            await expect(ClipperInner.getUser("moonmoon")).to.be.rejectedWith('getUser - status code is: 401');
        });
        it('should not throw if status code is 200', async function() {
            await expect(Clipper.getUser("moonmoon")).to.eventually.have.property("data")
        });
        it('should return an object', async function() {
            const result = await Clipper.getUser("moonmoon");
            expect(result).to.be.an('object');
        });
    });
    describe('getAccessToken', function() {
        it('should throw if status code is not 200', async function() {
            const fetchStubInner = function(){
                return Promise.resolve({
                    status: 401
                })
            };
            let ClipperClassInner = proxyquire('../lib/Clipper',{'node-fetch':fetchStubInner});
            let ClipperInner = new ClipperClassInner();

            await expect(ClipperInner.getAccessToken()).to.be.rejectedWith('getAccessToken - status code is: 401');
        });
        it('should not throw if status code is 200', async function() {
            await expect(Clipper.getAccessToken()).to.eventually.be.a('string')
        });
    });
});