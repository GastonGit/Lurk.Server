import { promises as fs } from 'fs';
import * as path from 'path';

export default class Container {
    private readonly fileName: string;
    private readonly location: string;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.location = path.join(__dirname, '../assets/' + this.fileName);
    }

    async update(list: string[]): Promise<void> {
        const data = JSON.stringify(list);

        await fs.writeFile(this.location, data);
    }

    async getList(): Promise<string[]> {
        const data = await fs.readFile(this.location, 'utf-8');

        return JSON.parse(data.toString());
    }
}
