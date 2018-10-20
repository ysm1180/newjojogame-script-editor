import { EditorRegistry, EditorDescriptor } from '../../browser/editor';
import { ResourceViewEditor } from '../../browser/parts/editor/resourceViewEditor';
import { ClassDescriptor } from '../../../../platform/instantiation/descriptor';
import { FileEditorInput } from '../files/fileEditorInput';
import { IEditorInput } from '../../../../platform/editor/editor';
import { TextFileEditor } from '../../browser/parts/editor/textFileEditor';
import { ControlEditor } from '../../browser/parts/editor/controlEditor';
import { ResourceEditorInput } from '../../common/editor/resourceEditorInput';

EditorRegistry.registerEditor(
    new EditorDescriptor(ResourceViewEditor, ResourceViewEditor.ID),
    new ClassDescriptor<IEditorInput>(ResourceEditorInput)
);

EditorRegistry.registerEditor(
    new EditorDescriptor(TextFileEditor, TextFileEditor.ID),
    new ClassDescriptor<IEditorInput>(FileEditorInput)
);

EditorRegistry.registerEditor(
    new EditorDescriptor(ControlEditor, ControlEditor.ID),
    new ClassDescriptor<IEditorInput>(FileEditorInput)
);