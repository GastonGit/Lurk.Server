import { promises as fs } from 'fs';
import * as path from 'path';
import Logger from './Logger';

export default class Container {
    private readonly fileName: string;
    private readonly location: string;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.location = path.join(
            __dirname,
            '../assets/lists/' + this.fileName,
        );
    }

    async updateList(list: string[]): Promise<void> {
        const data = JSON.stringify(list);

        try {
            await fs.writeFile(this.location, data, { flag: 'r+' });
        } catch (err) {
            Logger.error('updateList', 'Failed to update list', err as string);
        }
    }

    async getList(): Promise<string[]> {
        const data = await fs.readFile(this.location, 'utf-8');

        return JSON.parse(data.toString());
    }
}
