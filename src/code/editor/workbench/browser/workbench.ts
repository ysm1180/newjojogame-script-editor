import { DomBuilder, $ } from 'code/base/browser/domBuilder';
import { IInstantiationService, InstantiationService } from 'code/platform/instantiation/instantiationService';
import { ServiceStorage } from 'code/platform/instantiation/serviceStorage';
import { ITreeService, TreeService } from 'code/platform/tree/treeService';
import { ICommandService, CommandService } from 'code/platform/commands/commandService';
import { IKeybindingService, KeybindingService } from 'code/platform/keybindings/keybindingService';
import { Sidebar } from 'code/editor/workbench/browser/parts/sidebar';
import { WorkbenchLayout } from 'code/editor/workbench/browser/layout';
import { EditorPart, IEditorService } from 'code/editor/workbench/browser/parts/editor/editorPart';
import { TitlePart, ITitlePartService } from 'code/editor/workbench/browser/parts/titlePart';
import { IContextMenuService, ContextMenuService } from 'code/editor/workbench/services/contextmenuService';
import { IMe5DataService, Me5DataService } from 'code/editor/workbench/services/me5DataService';
import { IWindowClientService, WindowClientService } from '../../../platform/windows/windowsIpc';
import { IDialogService, DialogService } from '../services/electron-browser/dialogService';


export class Workbench {
    private container: HTMLElement;

    private workbenchContainer: DomBuilder;
    private workbench: DomBuilder;
    private workbenchLayout: WorkbenchLayout;

    private title: TitlePart;
    private sidebar: Sidebar;
    private editor: EditorPart;

    private serviceStorage: ServiceStorage;

    constructor(
        container: HTMLElement,
        serviceStorage: ServiceStorage,
        @IInstantiationService private instantiationService: InstantiationService
    ) {
        this.container = container;
        this.serviceStorage = serviceStorage;
    }

    public startup() {
        this.createWorkbench();

        this.initService();

        this.registerListeners();

        this.render();

        this.createLayout();
    }

    private initService() {
        this.serviceStorage.set(ITreeService, this.instantiationService.create(TreeService));

        this.serviceStorage.set(IWindowClientService, this.instantiationService.create(WindowClientService));
        this.serviceStorage.set(IDialogService, this.instantiationService.create(DialogService));

        this.serviceStorage.set(ICommandService, this.instantiationService.create(CommandService));
        this.serviceStorage.set(IContextMenuService, this.instantiationService.create(ContextMenuService));
        this.serviceStorage.set(IKeybindingService, this.instantiationService.create(KeybindingService, window));

        this.serviceStorage.set(IMe5DataService, this.instantiationService.create(Me5DataService));

        this.sidebar = this.instantiationService.create(Sidebar);
        this.editor = this.instantiationService.create(EditorPart);
        this.serviceStorage.set(IEditorService, this.editor);

        this.title = this.instantiationService.create(TitlePart);
        this.serviceStorage.set(ITitlePartService, this.title);
    }

    private createWorkbench() {
        this.workbenchContainer = $('.workbench-container');
        this.workbench = $().div({
            class: 'workbench'
        }).appendTo(this.workbenchContainer);
    }

    private render() {
        this.createTitle();
        this.createSidebar();
        this.createEditor();

        this.workbenchContainer.build(this.container);
    }

    private createTitle(): void {
        const titleContainer = $(this.workbench).div({
            class: 'title'
        });
        this.title.create(titleContainer);
    }

    private createSidebar(): void {
        const sidebarContainer = $(this.workbench).div({
            class: 'sidebar'
        });

        this.sidebar.create(sidebarContainer);
    }

    private createEditor(): void {
        const editorContainer = $(this.workbench).div({
            class: 'editor'
        });

        this.editor.create(editorContainer);
    }

    private createLayout(): void {
        this.workbenchLayout = new WorkbenchLayout(
            $(this.container),
            this.workbench,
            {
                title: this.title,
                sidebar: this.sidebar,
                editor: this.editor,
            });
    }

    public layout() {
        this.workbenchLayout.layout();
    }

    public registerListeners() {

    }

}