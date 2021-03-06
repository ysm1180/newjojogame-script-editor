import { isNullOrUndefined, isString } from 'jojo/base/common/types';
import { decorator } from 'jojo/platform/instantiation/common/instantiation';

export const IStorageService = decorator<StorageService>('storageService');

export class StorageService {
  constructor(private storage: Storage) {}

  public store(key: string, value: any) {
    if (isNullOrUndefined(value)) {
      this.remove(key);
      return;
    }

    if (typeof value === 'object') {
      this.storage.setItem(key, JSON.stringify(value));
    } else {
      this.storage.setItem(key, value);
    }
  }

  public get(key: string): string {
    return this.storage.getItem(key);
  }

  public getObject(key: string): Object {
    const value = this.get(key);

    if (isNullOrUndefined(value)) {
      return {};
    }

    return JSON.parse(value);
  }

  public getBoolean(key: string): boolean {
    const value = this.get(key);

    if (isString(value)) {
      return value.toLowerCase() === 'true' ? true : false;
    }

    return value ? true : false;
  }

  public remove(key: string) {
    this.storage.removeItem(key);
  }
}
