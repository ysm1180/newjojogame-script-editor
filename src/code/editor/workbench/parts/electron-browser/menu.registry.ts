import { MenuRegistry, MenuId } from 'code/platform/actions/registry';
import { ServicesAccessor } from 'code/platform/instantiation/instantiation';
import { IMe5DataService } from 'code/editor/workbench/services/me5DataService';
import { KeybindingsRegistry } from 'code/platform/keybindings/keybindingsRegistry';
import { KeyCode, KeyMode } from 'code/base/common/keyCodes';
import { explorerRootContext, explorerGroupContext } from 'code/editor/workbench/browser/parts/me5Explorer';
import { ContextKeyExpr } from 'code/platform/contexts/contextKey';
import { explorerEditContext } from 'code/editor/workbench/parts/me5ExplorerModel';

const INSERT_GROUP_ID = 'INSERT_GROUP';
const MODIFICATION_ID = 'MODIFICATION';
const INSERT_ITEM_ID = 'INSERT_ITEM';
const RENAME_ID = 'RENAME_COMMAND';
const DELETE_ID = 'DELETE_COMMAND';

KeybindingsRegistry.registerKeybindingRule({
    id: RENAME_ID,
    primary: KeyCode.F2,
    handler: (accessor: ServicesAccessor) => {
        const me5DataService = accessor.get(IMe5DataService);
        me5DataService.doRename();
    },
    when: ContextKeyExpr.and(explorerRootContext.not(), explorerEditContext.not()),
});

KeybindingsRegistry.registerKeybindingRule({
    id: DELETE_ID,
    primary: KeyCode.Delete,
    handler: (accessor: ServicesAccessor) => {
        const me5DataService = accessor.get(IMe5DataService);
        me5DataService.doDelete();
    },
    when: ContextKeyExpr.and(explorerRootContext.not(), explorerEditContext.not()),
});

KeybindingsRegistry.registerKeybindingRule({
    id: MODIFICATION_ID,
    primary: KeyMode.Ctrl | KeyCode.KEY_E,
    handler: (accessor: ServicesAccessor) => {
        const me5DataService = accessor.get(IMe5DataService);
        me5DataService.doChangeItem();
    },
    when: ContextKeyExpr.and(ContextKeyExpr.not(ContextKeyExpr.or(explorerGroupContext, explorerRootContext)), explorerEditContext.not()),
});

MenuRegistry.appendMenuItem(MenuId.Me5ExplorerTreeContext, {
    group: 'insert',
    label: '새 그룹',
    command: {
        id: INSERT_GROUP_ID,
        handler: (accessor: ServicesAccessor) => {
            const me5DataService = accessor.get(IMe5DataService);
            me5DataService.doInsertGroup();
        },
    },
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.or(explorerGroupContext, explorerRootContext), explorerEditContext.not()),
});

MenuRegistry.appendMenuItem(MenuId.Me5ExplorerTreeContext, {
    group: 'insert',
    label: '새 아이템',
    command: {
        id: INSERT_ITEM_ID,
        handler: (accessor: ServicesAccessor) => {
            const me5DataService = accessor.get(IMe5DataService);
            me5DataService.doInsertItem();
        },
    },
    order: 2,
    when: ContextKeyExpr.and(explorerGroupContext, explorerEditContext.not()),
});

MenuRegistry.appendMenuItem(MenuId.Me5ExplorerTreeContext, {
    group: 'modification',
    label: '수정',
    command: {
        id: MODIFICATION_ID,
    },
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.not(ContextKeyExpr.or(explorerGroupContext, explorerRootContext)), explorerEditContext.not()),
});

MenuRegistry.appendMenuItem(MenuId.Me5ExplorerTreeContext, {
    group: 'modification',
    label: '이름 바꾸기',
    command: {
        id: RENAME_ID,
    },
    order: 2,
    when: ContextKeyExpr.and(explorerRootContext.not(), explorerEditContext.not()),
});

MenuRegistry.appendMenuItem(MenuId.Me5ExplorerTreeContext, {
    group: 'modification',
    label: '삭제',
    command: {
        id: DELETE_ID,
    },
    order: 3,
    when: ContextKeyExpr.and(explorerRootContext.not(), explorerEditContext.not()),
});