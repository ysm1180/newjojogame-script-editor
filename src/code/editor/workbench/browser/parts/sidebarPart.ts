import { Event } from '../../../../base/common/event';
import { DomBuilder, $ } from '../../../../base/browser/domBuilder';
import { IInstantiationService } from '../../../../platform/instantiation/instantiationService';
import { Part } from '../part';
import { CompositeView, CompositViewRegistry } from '../compositeView';
import { IEditorService, EditorPart } from './editor/editorPart';
import { EditorGroup } from './editor/editors';
import { IPartService } from '../../services/part/partService';

export class SidebarPart extends Part {
    private instantiatedComposites: CompositeView[];
    private activeComposite: CompositeView;

    private group: EditorGroup;

    private mapCompositeToCompositeContainer: { [id: string]: DomBuilder };

    public onDidCompositeOpen = new Event<CompositeView>();
    public onDidCompositeClose = new Event<CompositeView>();

    constructor(
        @IPartService private partService: IPartService,
        @IEditorService private editorService: EditorPart,
        @IInstantiationService private instantiationService: IInstantiationService,
    ) {
        super();

        this.activeComposite = null;
        this.instantiatedComposites = [];
        this.mapCompositeToCompositeContainer = {};

        this.group = this.editorService.getEditorGroup();
        this.group.onEditorStateChanged.add(() => {
            this.onEditorChanged();
        });
    }

    private onEditorChanged() {
        const activeInput = this.group.activeEditor;
        if (!activeInput) {
            this.hideActiveComposite();
            this.partService.setSideBarHidden(true);
            return;
        }

        const descriptors = CompositViewRegistry.getCompositeViewDescriptors(activeInput);
        if (descriptors.length === 0) {
            this.hideActiveComposite();
            this.partService.setSideBarHidden(true);
            return;
        }


        for (let i = 0; i < descriptors.length; i++) {
            const id = descriptors[i].id;
            this.openCompositeView(id);
        }
        this.partService.setSideBarHidden(false);
    }

    public openCompositeView(id: string) {
        const composite = this.doOpenCompositeView(id);

        this.onDidCompositeOpen.fire(composite);
    }

    private doOpenCompositeView(id: string): CompositeView {
        if (this.activeComposite && this.activeComposite.getId() === id) {
            return this.activeComposite;
        }

        if (this.activeComposite) {
            this.hideActiveComposite();
        }

        const composite = this.createCompositeView(id);
        if (!composite) {
            return null;
        }

        this.activeComposite = composite;

        let compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
        if (!compositeContainer) {
            compositeContainer = $().div({
                'class': 'composite',
                id: composite.getId()
            });

            this.mapCompositeToCompositeContainer[composite.getId()] = compositeContainer;

            composite.create(compositeContainer);
        }

        compositeContainer.build(this.getContentArea());

        return composite;
    }

    private createCompositeView(id: string): CompositeView {
        for (let i = 0; i < this.instantiatedComposites.length; i++) {
            if (this.instantiatedComposites[i].getId() === id) {
                return this.instantiatedComposites[i];
            }
        }

        const compositeDescriptor = CompositViewRegistry.getCompositeViewDescriptor(id);
        if (compositeDescriptor) {
            const composite = this.instantiationService.create(compositeDescriptor.ctor);
            this.instantiatedComposites.push(composite);
            return composite;
        }

        return null;
    }

    private hideActiveComposite() {
        if (!this.activeComposite) {
            return;
        }

        const composite = this.activeComposite;
        this.activeComposite = null;

        const compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
        compositeContainer.offDOM();

        this.onDidCompositeClose.fire(composite);
    }

    public layout(width: number, height: number) {
        super.layout(width, height);
    }

    public dispose() {
        super.dispose();
    }
}