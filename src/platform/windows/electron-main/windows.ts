import { CodeWindow, IWindowCreationOption } from '../../../code/electron-main/window';
import { IMessageBoxResult, IOpenFileRequest, ISaveFileRequest } from '../windows';

import { Event } from '../../../base/common/event';
import { decorator } from '../../instantiation/instantiation';

export const IWindowMainService = decorator<IWindowMainService>('windowMainService');

export interface IWindowMainService {
  onWindowReady: Event<CodeWindow>;

  showOpenDialog(options: Electron.OpenDialogOptions): Promise<IOpenFileRequest>;
  showMessageBox(options: Electron.MessageBoxOptions): Promise<IMessageBoxResult>;
  showSaveDialog(options: Electron.SaveDialogOptions): Promise<ISaveFileRequest>;
  openNewWindow(options: IWindowCreationOption): void;
  openWorkingFiles(): void;
  quit(): void;
}
