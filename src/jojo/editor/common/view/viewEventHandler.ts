/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { Disposable } from 'jojo/base/common/lifecycle';
import { ViewConfigurationChangedEvent, ViewEvent, ViewEventType, ViewScrollChangedEvent } from 'jojo/editor/common/view/viewEvents';

export class ViewEventHandler extends Disposable {
  private _shouldRender: boolean;

  constructor() {
    super();
    this._shouldRender = true;
  }

  public shouldRender(): boolean {
    return this._shouldRender;
  }

  public forceShouldRender(): void {
    this._shouldRender = true;
  }

  protected setShouldRender(): void {
    this._shouldRender = true;
  }

  public onDidRender(): void {
    this._shouldRender = false;
  }

  // --- begin event handlers

  public onConfigurationChanged(e: ViewConfigurationChangedEvent): boolean {
    return false;
  }
  public onScrollChanged(e: ViewScrollChangedEvent): boolean {
    return false;
  }

  // --- end event handlers

  public handleEvents(events: ViewEvent[]): void {
    let shouldRender = false;

    for (let i = 0, len = events.length; i < len; i++) {
      let e = events[i];

      switch (e.type) {
        case ViewEventType.ConfigurtionChanged:
          if (this.onConfigurationChanged(e)) {
            shouldRender = true;
          }
          break;

        case ViewEventType.ScrollChanged:
          if (this.onScrollChanged(e)) {
            shouldRender = true;
          }
          break;

        default:
          console.info('View received unknown event: ');
          console.info(e);
      }
    }

    if (shouldRender) {
      this._shouldRender = true;
    }
  }
}
