import tmi from 'tmi.js';
import client from '../../stubs/tmiClientStub';
let tmiExport;

if (process.env.NODE_ENV === 'development') {
    tmiExport = {
        client,
        Client: client,
    };
} else {
    tmiExport = tmi;
}
export default tmiExport as typeof tmi;
