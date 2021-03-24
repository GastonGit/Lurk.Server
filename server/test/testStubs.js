const chai = require('chai')
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect

let fetchStub = require('../stubs/fetchStub');

describe('fetchStub methods', function() {
    describe('unexpected arguments', function() {
        it('should throw if not used with existing url', function() {
            expect(function(){fetchStub("test.com")}).to.throw();
        });
        describe('with expected url', function() {
            it('should throw if not used with the method option get', function() {
                expect(function(){fetchStub("https://api.twitch.tv/helix/streams?first=100")}).to.throw();
                expect(function(){fetchStub(
                    "https://api.twitch.tv/helix/streams?first=100",
                    {
                        method: "post"
                    }
                )}).to.throw();
            });
        });
        describe('with expected pagination url', function() {
            it('should throw if not used with the method option get', function() {
                expect(function(){fetchStub("https://api.twitch.tv/helix/streams?first=100&after=eyJiIjp7I" +
                    "kN1cnNvciI6ImV5SnpJam8wT1RJM05pNDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sTENKMElqcDBjbl" +
                    "ZsZlE9PSJ9LCJhIjp7IkN1cnNvciI6ImV5SnpJam96TnpjMUxqRXdNakE1TURrME9USTNPU3dpWkNJNlptRnN" +
                    "jMlVzSW5RaU9uUnlkV1Y5In19")}).to.throw();
                expect(function(){fetchStub(
                    "https://api.twitch.tv/helix/streams?first=100&after=eyJiIjp7IkN1cnNvciI6ImV5SnpJam8wT" +
                    "1RJM05pNDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sTENKMElqcDBjblZsZlE9PSJ9LCJhIjp7IkN1cn" +
                    "NvciI6ImV5SnpJam96TnpjMUxqRXdNakE1TURrME9USTNPU3dpWkNJNlptRnNjMlVzSW5RaU9uUnlkV1Y5In19",
                    {
                        method: "post"
                    }
                )}).to.throw();
            });
        });
        describe('with user login url', function() {
            it('should throw if not used with the method option get', function() {
                expect(function(){fetchStub("https://api.twitch.tv/helix/users?login=moonmoon")}).to.throw();
                expect(function(){fetchStub(
                    "https://api.twitch.tv/helix/users?login=moonmoon",
                    {
                        method: "post"
                    }
                )}).to.throw();
            });
        });
        describe('with user login url', function() {
            it('should throw if not used with the method option get', function() {
                expect(function(){fetchStub('https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=123&client_id=0&client_secret=321')}).to.throw();
                expect(function(){fetchStub(
                    'https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=123&client_id=0&client_secret=321',
                    {
                        method: "post"
                    }
                )}).to.throw();
            });
        });
    });
});