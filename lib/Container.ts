import { promises as fs } from 'fs';
import * as path from 'path';
import Logger from './Logger';

export default class Container {
    private readonly fileName: string;
    private readonly location: string;

    constructor(fileName: string) {
        this.fileName = fileName;
        let fileLocation: string;

        /* istanbul ignore if */
        if (path.dirname(<string>require.main?.filename).includes('/dist/')) {
            fileLocation = '../../assets/lists/';
        } else {
            fileLocation = '../assets/lists/';
        }

        this.location = path.join(
            path.dirname(<string>require.main?.filename),
            fileLocation + this.fileName,
        );
    }

    async updateList(list: string[]): Promise<void> {
        const data = JSON.stringify(list);

        try {
            await fs.truncate(this.location, 0);
            await fs.writeFile(this.location, data, { flag: 'r+' });
            Logger.info('updateList', 'List updated');
        } catch (err) {
            Logger.error(
                'updateList',
                'Failed to update file: ' + this.fileName,
                err as string,
            );
        }
    }

    async getList(): Promise<string[]> {
        try {
            const data = await fs.readFile(this.location, 'utf-8');
            Logger.info('getList', 'Stored clip list loaded');

            return JSON.parse(data.toString());
        } catch (err) {
            Logger.error('getList', 'Failed to get list', err as string);
            return [];
        }
    }
}
