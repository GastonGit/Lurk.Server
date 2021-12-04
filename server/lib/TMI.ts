import tmi, { ChatUserstate } from 'tmi.js';
import client from './dev/tmi.dev';
let tmiExport;

/* istanbul ignore else */
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    tmiExport = {
        client,
        Client: client,
    };
} else {
    tmiExport = tmi;
}
export default tmiExport as typeof tmi;
export type { ChatUserstate };
