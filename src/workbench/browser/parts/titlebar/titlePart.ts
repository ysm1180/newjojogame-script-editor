import { DomBuilder } from '../../../../base/browser/domBuilder';
import { IInstantiationService, decorator } from '../../../../platform/instantiation/instantiation';
import { Part } from '../../part';
import { EditorPart, IEditorGroupService } from '../editor/editorPart';
import { TabControl } from '../editor/tabControl';

export const ITitlePartService = decorator<TitlePart>('titlePart');

export class TitlePart extends Part {
  private tab: TabControl;

  constructor(
    @IEditorGroupService private editorService: EditorPart,
    @IInstantiationService private instantiationService: IInstantiationService
  ) {
    super();
  }

  public create(parent: DomBuilder) {
    super.create(parent);

    this.tab = this.instantiationService.create(TabControl);
    this.tab.create(this.getContentArea().getHTMLElement());

    const editors = this.editorService.getEditorGroup();
    this.tab.setContext(editors);

    this.editorService.onEditorChanged.add(() => {
      this.update();
    });
  }

  public update(): void {
    this.tab.refresh();
  }
}