import Fetcher from './Fetcher';
import { Clip } from './Interfaces';
import Logger from './Logger';
import TwitchRequests from './TwitchRequests';

export default class Clipper {
    public async createClip(streamer: string): Promise<Clip | undefined> {
        const user = await TwitchRequests.getUser(streamer);
        const userID = user?.id;

        if (typeof userID !== 'undefined') {
            const fetchResponse = await Fetcher.fetch(
                'https://api.twitch.tv/helix/clips?broadcaster_id=' +
                    userID.toLowerCase(),
            );

            if (
                (fetchResponse.status === 200 ||
                    fetchResponse.status === 202) &&
                typeof fetchResponse.data !== 'undefined'
            ) {
                Logger.success('createClip', streamer);
                return fetchResponse.data[0];
            } else {
                Logger.failure(
                    'createClip',
                    streamer,
                    'StatusCode=' + fetchResponse.status,
                );
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}
