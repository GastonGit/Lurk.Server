import tmi from 'tmi.js';
import client from '../../stubs/tmiClientStub';

if (process.env.NODE_ENV === 'development') {
    module.exports = {
        client,
        Client: client,
    };
} else {
    module.exports = tmi;
}
