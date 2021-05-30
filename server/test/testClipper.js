const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const proxyquire = require('proxyquire');
const fetchStub = require('../stubs/fetchStub');

let ClipperClass = proxyquire('../lib/Clipper',{'node-fetch':fetchStub});
let Clipper

describe('Clipper methods', function() {
    before(function (){
        Clipper = new ClipperClass();
    })
    describe('Get clip', function() {
        it('should take a string argument', async function() {
            await expect(Clipper.getClip()).to.be.rejectedWith('Argument is undefined');
            await expect(Clipper.getClip(123)).to.be.rejectedWith('Argument is not a string');
            await expect(Clipper.getClip('moonmoon')).to.be.fulfilled;
        });
        it('should return an object with containing an array with id', async function() {
            const result = await Clipper.getClip("SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl");
            expect(result).to.be.an('object');
            expect(result).to.have.property('id');
            expect(result.id).to.equal('SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl');
        });
    });
    describe('Create clip', function() {
        it('should take a string argument', async function() {
            await expect(Clipper.createClip()).to.be.rejectedWith('Argument is undefined');
            await expect(Clipper.createClip(123)).to.be.rejectedWith('Argument is not a string');
            await expect(Clipper.createClip('moonmoon')).to.be.fulfilled;
        });
        it('should return an object property id', async function() {
            const result = await Clipper.createClip("MoonMoon");

            const data = result.data;

            expect(data).to.be.an('object');
            expect(data).to.have.property('id');
            expect(data.id).to.equal('EphemeralClumsyCatKAPOW-SzCaOix1-olnn42x');
        });
        it('should return an object when NODE_ENV is set to test_values', async function() {
            process.env.NODE_ENV='test_values';
            const result = await Clipper.createClip("MoonMoon");
            expect(result).to.be.an('object');
            delete process.env.NODE_ENV;
        });
        it('should return false if status code is not 200', async function() {
            const fetchStubInner = function(url){
                if (url.includes("broadcaster_id=")){
                    const result = {
                        "data": [
                            {
                                "id": "SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl",
                                "thumbnail_url": "https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg",
                            }
                        ]
                    }
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 503
                    })
                } else if(url.includes("oauth2/token?grant_type=")){
                    const result = {"access_token": "j9b1e59"}
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                } else if(url.includes("/helix/users?")){
                    const result = {"data":[{"id": "121059319"}]}
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                }
            };
            let ClipperClassInner = proxyquire('../lib/Clipper',{'node-fetch':fetchStubInner});
            let ClipperInner = new ClipperClassInner();

            const result = await ClipperInner.createClip("MoonMoon");

            expect(result.created).to.be.false;
        });
        it('should return true if status code is 200', async function() {
            const fetchStubInner = function(url){
                if (url.includes("broadcaster_id=")){
                    const result = {
                        "data": [
                            {
                                "id": "SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl",
                                "thumbnail_url": "https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg",
                            }
                        ]
                    }
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                } else if(url.includes("oauth2/token?grant_type=")){
                    const result = {"access_token": "j9b1e59"}
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                } else if(url.includes("/helix/users?")){
                    const result = {"data":[{"id": "121059319"}]}
                    return Promise.resolve({
                        json: () => Promise.resolve(result),
                        status: 200
                    })
                }
            };
            let ClipperClassInner = proxyquire('../lib/Clipper',{'node-fetch':fetchStubInner});
            let ClipperInner = new ClipperClassInner();

            const result = await ClipperInner.createClip("MoonMoon");

            expect(result.created).to.be.true;
        });
    });
    describe('getVideoUrl', function() {
        it('should take a string argument', async function() {
            await expect(Clipper.getVideoUrl()).to.be.rejectedWith('Argument is undefined');
            await expect(Clipper.getVideoUrl(123)).to.be.rejectedWith('Argument is not a string');
            await expect(Clipper.getVideoUrl('moonmoon')).to.be.fulfilled;
        });
        it('should call getClip', function() {
            chai.spy.on(Clipper, 'getClip');
            expect(Clipper.getClip).to.be.spy;

            Clipper.getVideoUrl('SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl');

            expect(Clipper.getClip).to.have.been.called();
        });
        it('should return a twitch clip mp4 url as a string', async function() {
            const result = await Clipper.getVideoUrl("SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl");
            expect(result).to.be.an('string');
            expect(result).to.equal('https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4');
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