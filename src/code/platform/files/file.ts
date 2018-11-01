import * as path from 'path';
import * as fs from 'fs';
import * as Convert from '../../base/common/convert';
import { isString } from '../../base/common/types';
import { isBuffer } from 'util';

export namespace Files {
    export const me5 = 'me5';
    export const lua = 'lua';
    export const dlg = 'dlg';
}

export class BinaryFile {
    public data: Buffer = Buffer.alloc(0);
    protected _path: string;
    protected tempData: { buffer: Buffer, offset: number }[];
    protected dataSize: number;

    constructor(resource: string | Buffer) {
        if (isString(resource)) {
            this._path = resource;
        } else if (isBuffer(resource)) {
            this._path = null;
            this.data = resource;
        }
    }

    public get path(): string {
        return this._path;
    }

    public get ext(): string {
        if (this._path) {
            return path.extname(this._path).substr(1).toLowerCase();
        }

        return null;
    }

    public get name(): string {
        if (this._path) {
            return path.basename(this._path).replace(path.extname(this._path), '');
        }

        return null;
    }

    public open(): Promise<BinaryFile> {
        if (this._path) {
            return new Promise<BinaryFile>((c, e) => {
                fs.readFile(this._path, {}, (err, data) => {
                    if (err) {
                        e(err);
                        return null;
                    }

                    this.data = data;

                    c(this);
                });
            });
        } else if (this.data.length > 0) {
            return Promise.resolve(this);
        } else {
            return Promise.reject(new Error('Fail to open file'));
        }
    }

    public readNumber(offset: number): number {
        const bytes: ArrayBuffer = this.data.buffer.slice(offset, offset + 4);
        return new Uint32Array(bytes)[0];
    }

    public readByte(offset: number): number {
        return this.data.buffer[offset];
    }

    public readString(offset: number, length: number) {
        return this.data.toString('utf-8', offset, offset + length);
    }

    public readBytes(offset: number, length: number): Uint8Array {
        return new Uint8Array(this.data.buffer.slice(offset, offset + length));
    }

    public write(offset: number, length: number, data: Buffer) {
        this.tempData.push({
            offset,
            buffer: data,
        });
        this.dataSize += length;
    }

    public finish(): Promise<void> {
        return new Promise((c, e) => {
            this.data = Buffer.alloc(this.dataSize);
            this.tempData.forEach(element => {
                this.data.set(element.buffer, element.offset);
            });
            this.tempData = [];

            fs.open(this._path, 'w', (openError, fd) => {
                if (openError) {
                    return e(openError);
                }
                fs.write(fd, this.data, writeError => {
                    if (writeError) {
                        return fs.close(fd, () => e(writeError));
                    }

                    fs.fdatasync(fd, syncError => {
                        if (syncError) {
                            console.warn('[node.js fs] fdatasync is now disabled for this session because it failed: ', syncError);
                            return e(syncError);
                        }

                        fs.close(fd, closeError => {
                            if (closeError) {
                                return e(closeError);
                            }
                            
                            return c();
                        });
                    });
                });
            });
        });
    }

    public writeInt(offset: number, data: number) {
        this.write(offset, 4, Convert.intToBytes(data));
    }
}