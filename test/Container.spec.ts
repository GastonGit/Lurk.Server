import { expect } from 'chai';
import sinon from 'sinon';
import Logger from '../lib/Logger';
import Container from '../lib/Container';
import {
    Mode,
    ObjectEncodingOptions,
    OpenMode,
    PathLike,
    promises as fs,
} from 'fs';
import { Abortable } from 'events';
import { Stream } from 'stream';

const container = new Container('test.json');

let writeFile: sinon.SinonStub<
    [
        file: PathLike | fs.FileHandle,
        data:
            | string
            | NodeJS.ArrayBufferView
            | Iterable<string | NodeJS.ArrayBufferView>
            | AsyncIterable<string | NodeJS.ArrayBufferView>
            | Stream,
        options?:
            | (ObjectEncodingOptions & {
                  mode?: Mode | undefined;
                  flag?: OpenMode | undefined;
              } & Abortable)
            | BufferEncoding
            | null
            | undefined,
    ],
    Promise<void>
>;

describe('Container suite', () => {
    beforeEach(() => {
        sinon.stub(Logger, 'error');
        sinon.stub(Logger, 'success');
        sinon.stub(Logger, 'info');
        sinon.stub(fs, 'truncate').resolves();
        sinon.stub(fs, 'readFile').resolves();
        writeFile = sinon.stub(fs, 'writeFile').resolves();
    });
    afterEach(() => {
        sinon.restore();
        writeFile.restore();
    });
    describe('updateList', () => {
        it('should resolve', async () => {
            await container.updateList(['test']);
        });
        it('should not throw if writing fails', async () => {
            writeFile.restore();
            writeFile = sinon.stub(fs, 'writeFile').rejects();

            await expect(
                container.updateList(['test1']),
            ).to.not.be.rejectedWith();
        });
    });
    describe('getList', () => {
        it('should return an array', async () => {
            writeFile.restore();
            writeFile = sinon.stub(fs, 'writeFile').resolves();

            const list = await container.getList();

            expect(list).to.deep.equal([]);
        });
        it('should return an empty array if file is not found', async () => {
            const container2 = new Container('notfound.json');
            const list = await container2.getList();

            expect(list).to.deep.equal([]);
        });
    });
});
