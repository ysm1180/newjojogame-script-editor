import { DomBuilder } from '../../../../base/browser/domBuilder';
import { Tree, ITreeOptions, ITreeConfiguration } from '../../../../base/parts/tree/browser/tree';
import {  IEditorInput } from '../../../../platform/editor/editor';
import { ITreeService, TreeService } from '../../../../platform/tree/treeService';
import { RawContextKey, ContextKeyExpr, ContextKeyNotExpr } from '../../../../platform/contexts/contextKey';
import { ContextKey, IContextKeyService, ContextKeyService } from '../../../../platform/contexts/contextKeyService';
import { IInstantiationService } from '../../../../platform/instantiation/instantiationService';
import { CompositeView } from '../compositeView';
import { IEditorService, EditorPart } from './editor/editorPart';
import { Me5Stat } from '../../parts/files/me5Data';
import { ICompositeViewService, CompositeViewService } from '../../services/view/compositeViewService';
import { Me5DataSource, Me5DataRenderer, Me5DataController } from '../../parts/me5ExplorerViewer';
import { IMe5FileService, Me5FileService } from '../../services/me5/me5FileService';
import { EditorGroup } from './editor/editorGroup';

export const me5ExplorerItemIsMe5GroupId = 'explorerItemIsMe5Group';
export const me5ExplorerItemIsMe5StatId = 'explorerItemIsMe5Stat';

export const me5ExplorerGroupContext = new RawContextKey<boolean>(me5ExplorerItemIsMe5GroupId, false);
export const me5ExplorerRootContext = new RawContextKey<boolean>(me5ExplorerItemIsMe5StatId, false);

export const me5ExplorerItemContext: ContextKeyNotExpr = ContextKeyExpr.not(ContextKeyExpr.or(me5ExplorerGroupContext, me5ExplorerRootContext));

export class Me5Tree extends Tree {
    private _cache = new Map<IEditorInput, Me5Stat>();

    constructor(
        container: HTMLElement,
        configuration: ITreeConfiguration,
        options: ITreeOptions,
        @ITreeService treeService: TreeService,
    ) {
        super(container,
            {
                dataSource: configuration.dataSource,
                renderer: configuration.renderer,
                controller: configuration.controller
            },
            {
                ...options,
                ...{ indentPixels: 12 }
            }
        );

        treeService.register(this);
    }

    public cache(key: IEditorInput): Me5Stat {
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        return null;
    }

    public setCache(key: IEditorInput, value: Me5Stat): void {
        if (key) {
            this._cache.set(key, value);
        }
    }
}

export const EXPLORER_VIEW_ID = 'workbench.view.explorer';

export class Me5ExplorerView extends CompositeView {
    private explorerViewer: Me5Tree;
    private dataSource: Me5DataSource;
    private renderer: Me5DataRenderer;
    private controller: Me5DataController;

    private toExpandElements = {};

    private groupContext: ContextKey<boolean>;
    private rootContext: ContextKey<boolean>;

    private group: EditorGroup;

    private prevInput: IEditorInput;

    constructor(
        @IMe5FileService private me5FileService: Me5FileService,
        @IContextKeyService private contextKeyService: ContextKeyService,
        @IEditorService private editorService: EditorPart,
        @ICompositeViewService private compositeViewService: CompositeViewService,
        @IInstantiationService private instantiationService: IInstantiationService,
    ) {
        super(EXPLORER_VIEW_ID);

        this.dataSource = this.instantiationService.create(Me5DataSource);
        this.renderer = this.instantiationService.create(Me5DataRenderer);
        this.controller = this.instantiationService.create(Me5DataController);

        this.groupContext = me5ExplorerGroupContext.bindTo(this.contextKeyService);
        this.rootContext = me5ExplorerRootContext.bindTo(this.contextKeyService);

        this.prevInput = null;
    }

    public create(container: DomBuilder) {
        this.explorerViewer = this.instantiationService.create(Me5Tree,
            container.getHTMLElement(),
            {
                dataSource: this.dataSource,
                renderer: this.renderer,
                controller: this.controller
            },
            {}
        );

        this.registerDispose(this.explorerViewer.onDidChangeFocus.add((e) => {
            const focused = e.focus as Me5Stat;
            if (focused) {
                this.groupContext.set(focused.isGroup && !focused.isRoot);
                this.rootContext.set(focused.isRoot);
            }
        }));
        
        this.group = this.editorService.getEditorGroup();

        this.registerDispose(this.compositeViewService.onDidCompositeOpen.add((composit) => this._onChangedCompositView(composit)));
        this.registerDispose(this.group.onEditorClosed.add((editor) => {
            this.explorerViewer.setCache(editor, null);

            const activeEditorInput = this.group.activeEditor;
            if (!activeEditorInput) {
                this.prevInput = null;
                this.explorerViewer.setRoot(null);
            }
        }));
    }

    private _onChangedCompositView(composit: CompositeView) {
        if (composit !== this) {
            return;
        }

        const previousRoot = this.explorerViewer.getRoot() as Me5Stat;
        if (previousRoot) {
            this.setExpandedElements(previousRoot.getId());
        }

        const activeEditorInput = this.group.activeEditor;
        if (!activeEditorInput) {
            return;
        }

        if (this.group.matches(activeEditorInput, this.prevInput)) {
            return;
        }

        this.prevInput = activeEditorInput;

        let done: Promise<Me5Stat>;
        const filePath = activeEditorInput.getId();
        const cacheData = this.explorerViewer.cache(activeEditorInput);
        if (cacheData) {
            done = Promise.resolve(cacheData);
        } else {
            done = this.me5FileService.resolve(filePath);
        }

        done.then((stat) => {
            this.explorerViewer.setCache(activeEditorInput, stat);
            this.explorerViewer.setRoot(stat).then(() => {
                const toExpand = this.toExpandElements[stat.getId()];
                if (toExpand) {
                    this.explorerViewer.expandAll(toExpand);
                }
            });
        });
    }

    private setExpandedElements(key: string) {
        const expandedElements = this.explorerViewer.getExpandedElements();
        this.toExpandElements[key] = expandedElements;
    }

    public layout(): void {
        if (this.explorerViewer) {
            this.explorerViewer.layout();
        }
    }
}