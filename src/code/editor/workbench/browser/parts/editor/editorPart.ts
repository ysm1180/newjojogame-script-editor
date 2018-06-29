import { DomBuilder, $ } from 'code/base/browser/domBuilder';
import { Event } from 'code/base/common/event';
import { IEditorInput, IEditorEvent } from 'code/platform/editor/editor';
import { Part } from 'code/editor/workbench/browser/part';
import { Editors } from 'code/editor/workbench/browser/parts/editor/editors';
import { BaseEditor } from 'code/editor/workbench/browser/parts/editor/baseEditor';
import { Me5ItemViewEditor } from 'code/editor/workbench/browser/parts/editor/me5ItemViewEditor';
import { decorator } from 'code/platform/instantiation/instantiation';
import { IInstantiationService, InstantiationService } from 'code/platform/instantiation/instantiationService';
import { TextEditor } from 'code/editor/workbench/browser/parts/editor/textEditor';

export const IEditorService = decorator<EditorPart>('editorPart');

export class EditorPart extends Part {
    private editorContainer: DomBuilder;

    private editors: Editors;
    private currentEditor: BaseEditor;

    public onEditorChanged = new Event<void>();
    public onEditorInputChanged = new Event<IEditorEvent>();
    public onEditorClosed = new Event<IEditorEvent>();

    constructor(
        @IInstantiationService private instantiationService: InstantiationService,
    ) {
        super();

        this.editors = new Editors();
        this.currentEditor = null;
    }

    public getEditors() {
        return this.editors;
    }

    public create(parent: DomBuilder) {
        super.create(parent);

        this.editorContainer = $(this.getContentArea()).div({
            class: 'editor-container'
        });
    }

    public layout(width: number, height: number) {
        super.layout(width, height);

        this.editorContainer.size(width, height);
    }

    public openEditor(editor: IEditorInput) {
        function describe(dataType: string): string {
            if (dataType === 'me5') {
                return Me5ItemViewEditor.ID;
            }

            return 'editor.baseeditor';
        }

        if (!editor) {
            return;
        }

        const isChanged = !this.editors.isActive(editor);

        const editorId = describe(editor.getType());
        if (this.currentEditor && this.currentEditor.getId() === editorId) {

        } else {
            if (!this.createViewEditor(editorId, editor.getType())) {
                return;
            }
        }
        this.editors.openEditor(editor);

        if (isChanged) {
            this.onEditorChanged.fire();
        }
    }

    public setInput(input: IEditorInput) {
        this.currentEditor.setInput(input).then(() => {
            const eventData : IEditorEvent = {
                editor: input,
            };
            this.onEditorInputChanged.fire(eventData);    
        });
    }

    private createViewEditor(id: string, type: string): BaseEditor {
        if (this.currentEditor) {
            this.currentEditor.dispose();
        }

        let editor: BaseEditor = null;
        if (type === 'me5') {
            editor = this.instantiationService.create(Me5ItemViewEditor, id);
        } else if (type === 'lua') {
            editor = this.instantiationService.create(TextEditor, id);
        }

        this.currentEditor = editor;

        if (!editor.getContainer()) {
            editor.create(this.editorContainer);
        }

        return editor;
    }

    public closeEditor(input: IEditorInput) {
        if (this.editors.isActive(input)) {
            this.closeActiveEditor();
        } else {
            this.closeInactiveEditor(input);
        }

        const closeEventData: IEditorEvent = {
            editor: input
        };
        this.onEditorClosed.fire(closeEventData);
        this.onEditorChanged.fire();
    }

    private closeActiveEditor() {
        this.editors.closeEditor(this.editors.activeEditor);

        if (this.editors.count > 0) {
            this.openEditor(this.editors.activeEditor);
        }
    }

    private closeInactiveEditor(input: IEditorInput) {
        this.editors.closeEditor(input, false);
    }

    public getActiveEditorInput(): IEditorInput {
        return this.editors.activeEditor;
    }
}