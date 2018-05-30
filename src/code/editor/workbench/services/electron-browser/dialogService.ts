import { IConfirmation, IConfirmationResult, IOpenningFile, getFileFilters } from 'code/platform/dialogs/dialogs';
import { decorator } from 'code/platform/instantiation/instantiation';
import { IOpenFileRequest } from 'code/platform/windows/windows';
import { IWindowService } from 'code/electron-main/windows';

export const IDialogService = decorator<DialogService>('dialogService');


export class DialogService {
    constructor(
        @IWindowService private windowService: IWindowService,
    ) {

    }

    public openFile(openning: IOpenningFile): Promise<IOpenFileRequest> {
        const options = this.getOpenFileOptions(openning);

        return this.windowService.showOpenDialog(options);
    }

    private getOpenFileOptions(openning: IOpenningFile): Electron.OpenDialogOptions {
        if (!openning.extensions) {
            openning.extensions = [
                {
                    extensions: '*',
                },
            ];
        }

        const options: Electron.OpenDialogOptions = {
            title: openning.title,
            properties: ['openFile', 'showHiddenFiles'],
            filters: getFileFilters(...openning.extensions),
        };

        if (openning.multi) {
            options.properties.push('multiSelections');
        }

        return options;
    }

    public confirm(confirmation: IConfirmation): Promise<IConfirmationResult> {
        const options = this.getConfirmationOptions(confirmation);

        return this.windowService.showMessageBox(options).then(({ button, checkboxChecked }) => {
            return {
                confirmed: button === 0,
                checkboxChecked
            };
        });
    }

    private getConfirmationOptions(confirmation: IConfirmation): Electron.MessageBoxOptions {
        const buttons: string[] = [];
        if (confirmation.primaryButton) {
            buttons.push(confirmation.primaryButton);
        } else {
            buttons.push('확인');
        }

        if (confirmation.secondaryButton) {
            buttons.push(confirmation.secondaryButton);
        } else if (typeof confirmation.secondaryButton === 'undefined') {
            buttons.push('취소');
        }

        const options: Electron.MessageBoxOptions = {
            title: confirmation.title,
            message: confirmation.message,
            buttons,
            cancelId: 1
        };

        if (confirmation.detail) {
            options.detail = confirmation.detail;
        }

        if (confirmation.type) {
            options.type = confirmation.type;
        }

        if (confirmation.checkbox) {
            options.checkboxLabel = confirmation.checkbox.label;
            options.checkboxChecked = confirmation.checkbox.checked;
        }

        return options;
    }
}