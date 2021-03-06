import * as dom from 'jojo/base/browser/dom';
import { IKeyboardEvent, StandardKeyboardEvent } from 'jojo/base/browser/keyboardEvent';
import { IMouseEvent, StandardMouseEvent } from 'jojo/base/browser/mouseEvent';
import { Disposable } from 'jojo/base/common/lifecycle';

export abstract class Widget extends Disposable {
  protected onclick(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.CLICK, (e: MouseEvent) =>
        listener(new StandardMouseEvent(e))
      )
    );
  }

  protected onmousedown(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.MOUSE_DOWN, (e: MouseEvent) =>
        listener(new StandardMouseEvent(e))
      )
    );
  }

  protected onmouseover(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.MOUSE_OVER, (e: MouseEvent) =>
        listener(new StandardMouseEvent(e))
      )
    );
  }

  protected onmouseout(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.MOUSE_OUT, (e: MouseEvent) =>
        listener(new StandardMouseEvent(e))
      )
    );
  }

  protected onkeydown(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.KEY_DOWN, (e: KeyboardEvent) =>
        listener(new StandardKeyboardEvent(e))
      )
    );
  }

  protected onkeyup(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void {
    this.registerDispose(
      dom.addDisposableEventListener(domNode, dom.EventType.KEY_UP, (e: KeyboardEvent) =>
        listener(new StandardKeyboardEvent(e))
      )
    );
  }

  protected oninput(domNode: HTMLElement, listener: (e: Event) => void): void {
    this.registerDispose(dom.addDisposableEventListener(domNode, dom.EventType.INPUT, listener));
  }

  protected onblur(domNode: HTMLElement, listener: (e: Event) => void): void {
    this.registerDispose(dom.addDisposableEventListener(domNode, dom.EventType.BLUR, listener));
  }

  protected onfocus(domNode: HTMLElement, listener: (e: Event) => void): void {
    this.registerDispose(dom.addDisposableEventListener(domNode, dom.EventType.FOCUS, listener));
  }

  protected onchange(domNode: HTMLElement, listener: (e: Event) => void): void {
    this.registerDispose(dom.addDisposableEventListener(domNode, dom.EventType.CHANGE, listener));
  }
}
