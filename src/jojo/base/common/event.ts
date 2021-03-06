import { IDisposable, once, toDisposable } from 'jojo/base/common/lifecycle';
import { LinkedList } from 'jojo/base/common/linkedList';

export type Listener<T> = (e: T) => any;

export class ChainEventStorage<T> {
  private _relayEvent: Event<T>;
  private _pendingEvents: Event<T>[];
  private _disposable: IDisposable[];

  constructor() {
    this._relayEvent = null;
    this._pendingEvents = [];
    this._disposable = [];
  }

  public set(event: Event<T>): IDisposable {
    this._relayEvent = event;

    const removes = [];
    if (this._pendingEvents.length) {
      this._pendingEvents.forEach((e) => {
        removes.push(this.add(e));
      });
      this._pendingEvents = [];
    }
    return toDisposable(...removes);
  }

  public add(event: Event<T>): IDisposable {
    if (!this._relayEvent) {
      this._pendingEvents.push(event);

      return toDisposable(() => {
        const index = this._pendingEvents.indexOf(event);
        if (index !== -1) {
          this._pendingEvents.splice(index, 1);
        }
      });
    } else {
      const remove = event.add(this._relayEvent.listener);
      this._disposable.push(remove);

      return remove;
    }
  }

  public dispose(): void {
    this._disposable.forEach((disposable) => {
      disposable.dispose();
    });
    this._relayEvent = null;
    this._pendingEvents = [];
  }
}

export class Event<T> {
  private _listeners = new LinkedList<Function | [Function, any]>();

  public get listener(): Listener<T> {
    return (e: T): void => {
      this.fire(e);
    };
  }

  public add(listener: Listener<T>, thisArg?: any): IDisposable {
    const remove = this._listeners.push(thisArg ? [listener, thisArg] : listener);

    return toDisposable(once(remove));
  }

  public fire(event?: T): void {
    if (this._listeners) {
      const queue: [Function | [Function, any], T][] = [];

      for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
        queue.push([e.value, event]);
      }

      while (queue.length > 0) {
        const [listener, event] = queue.shift();
        if (typeof listener === 'function') {
          listener.call(undefined, event);
        } else {
          listener[0].call(listener[1], event);
        }
      }
    }
  }

  public dispose(): void {
    if (this._listeners) {
      this._listeners = undefined;
    }
  }
}

export class RelayEvent<T> {
  private _event = new Event<T>();

  public set event(event: Event<T>) {
    event.add(this._event.listener);
  }

  public add(fn: Listener<T>, thisArg?: any): IDisposable {
    const remove = this._event.add(fn, thisArg);

    return remove;
  }
}
