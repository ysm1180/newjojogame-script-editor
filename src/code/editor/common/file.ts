import * as Convert from 'code/base/common/convert';
import { BinaryFile } from 'code/platform/files/file';
import { Me5Group, Me5Stat, Me5Item } from 'code/editor/workbench/parts/files/me5Data';

export interface ISaveMe5Data {
    stat: Me5Stat;
}

export class Me5File extends BinaryFile {
    private static readonly ALL_ITEM_COUNT_OFFSET = 1;
    private static readonly GROUP_COUNT_OFFSET = 5;

    private static readonly ITEM_HEADER_SIZE = 12;
    private static readonly GROUP_HEADER_SIZE = 12;

    private static readonly GROUP_INFO_START_OFFSET = 9;
    private itemInfoStartOffset: number;

    constructor(path: string) {
        super(path);
    }

    public open(): Promise<void | Buffer> {
        return super.open().then((data) => {
            this.itemInfoStartOffset = this.getGroupCount() * Me5File.GROUP_HEADER_SIZE + Me5File.GROUP_INFO_START_OFFSET;
            return data;
        }, (e: NodeJS.ErrnoException) => {
        });
    }

    public isEncoding(): boolean {
        return this.readByte(0) === 1 ? true : false;
    }

    public getAllItemCount(): number {
        return this.readNumber(Me5File.ALL_ITEM_COUNT_OFFSET);
    }

    public getGroupCount(): number {
        return this.readNumber(Me5File.GROUP_COUNT_OFFSET);
    }

    private getFirstItemIndexInGroup(groupIndex: number) {
        return this.readNumber(Me5File.GROUP_INFO_START_OFFSET + 4 + groupIndex * Me5File.GROUP_HEADER_SIZE);
    }

    private getLastItemIndexInGroup(groupIndex: number) {
        return this.readNumber(Me5File.GROUP_INFO_START_OFFSET + 8 + groupIndex * Me5File.GROUP_HEADER_SIZE);
    }

    public getGroupItemCount(groupIndex: number) {
        return this.getLastItemIndexInGroup(groupIndex) - this.getFirstItemIndexInGroup(groupIndex) + 1;
    }

    private getOffsetByItemIndex(itemIndex: number): number {
        const groupCount = this.getGroupCount();
        return this.readNumber(this.itemInfoStartOffset + itemIndex * Me5File.ITEM_HEADER_SIZE);
    }

    private getItemOffset(groupIndex: number, subItemIndex: number): number {
        const firstItemIndex = this.getFirstItemIndexInGroup(groupIndex);
        return this.getOffsetByItemIndex(firstItemIndex + subItemIndex);
    }

    public getGroupNameLength(groupIndex: number): number {
        return this.readNumber(Me5File.GROUP_INFO_START_OFFSET + groupIndex * Me5File.GROUP_HEADER_SIZE);
    }

    public getItemNameLength(groupIndex: number, subItemIndex: number) {
        const firstItemIndex = this.getFirstItemIndexInGroup(groupIndex);
        return this.readNumber(this.itemInfoStartOffset + 4 + (firstItemIndex + subItemIndex) * Me5File.ITEM_HEADER_SIZE);
    }

    public getGroupName(groupIndex: number): string {
        let offset = this.getItemOffset(groupIndex, 0);
        const length = this.getGroupNameLength(groupIndex);
        offset -= length;
        return this.readString(offset, length);
    }

    public getItemName(groupIndex: number, subItemIndex: number): string {
        const itemOffset = this.getItemOffset(groupIndex, subItemIndex);
        const itemNameLength = this.getItemNameLength(groupIndex, subItemIndex);
        return this.readString(itemOffset, itemNameLength);
    }

    public getItemSize(groupIndex: number, subItemIndex: number): number {
        const firstItemIndex = this.getFirstItemIndexInGroup(groupIndex);
        return this.readNumber(this.itemInfoStartOffset + 8 + (firstItemIndex + subItemIndex) * Me5File.ITEM_HEADER_SIZE);
    }

    public getItemData(groupIndex: number, subItemIndex: number): Uint8Array {
        const offset = this.getItemOffset(groupIndex, subItemIndex);
        const itemSize = this.getItemSize(groupIndex, subItemIndex);
        const itemNameLength = this.getItemNameLength(groupIndex, subItemIndex);
        return this.readBytes(offset + itemNameLength, itemSize);
    }

    public save(data: ISaveMe5Data) {
        const groups = data.stat.getChildren((group) => group.getChildren().length !== 0);
        
        const itemLengths = groups.map((group) => group.getChildren().length);
        this.setAllItemCount(itemLengths.reduce((pre, cur) => pre + cur, 0));
        this.setGroupCount(groups.length);

        this.itemInfoStartOffset = groups.length * Me5File.GROUP_HEADER_SIZE + Me5File.GROUP_INFO_START_OFFSET;
        
        let baseItemIndex = 0;
        for (const group of groups) {
            this.setGroupInfo(group, baseItemIndex);

            const items = group.getChildren();
            for (const item of items) {
                this.setItemInfo(item, baseItemIndex);
            }
            baseItemIndex += items.length;
        }

        let offset = this.itemInfoStartOffset + baseItemIndex * Me5File.ITEM_HEADER_SIZE;
        baseItemIndex = 0;
        for (const group of groups) {
            offset += this.setGroup(offset, group);

            const items = group.getChildren();
            for (const item of items) {
                offset += this.setItem(offset, item, baseItemIndex);
            }
            baseItemIndex += items.length;
        }
    }

    private setAllItemCount(count: number) {
        this.writeInt(Me5File.ALL_ITEM_COUNT_OFFSET, count);
    }

    private setGroupCount(count: number) {
        this.writeInt(Me5File.GROUP_COUNT_OFFSET, count);
    }

    private setGroupInfo(group: Me5Group, baseItemIndex: number) {
        const offset = Me5File.GROUP_INFO_START_OFFSET + group.index() * Me5File.GROUP_HEADER_SIZE;
        this.writeInt(offset + 4, baseItemIndex); // Item Begin Index
        this.writeInt(offset + 8, baseItemIndex + group.getChildren().length - 1); // Item End Index
        this.writeInt(offset, Convert.getByteLength(group.getName()));
    }

    private setItemInfo(item: Me5Item, baseItemIndex: number) {
        const offset = this.itemInfoStartOffset + (baseItemIndex + item.index()) * Me5File.ITEM_HEADER_SIZE;
        this.writeInt(offset, 0); // item offset
        this.writeInt(offset + 4, Convert.getByteLength(item.getName()));
        this.writeInt(offset + 8, item.data.length); // item size
    }

    private setGroup(offset: number, group: Me5Group): number {
        const name = group.getName();
        const length = Convert.getByteLength(name);
        
        this.write(offset, length, Convert.strToBytes(name));

        return length;
    }

    private setItem(offset: number, item: Me5Item, baseItemIndex: number): number {
        const name = item.getName();
        const length = Convert.getByteLength(name);

        const startItemOffset = this.itemInfoStartOffset + (baseItemIndex + item.index()) * Me5File.ITEM_HEADER_SIZE;
        this.writeInt(startItemOffset, offset);
        this.write(offset, length, Convert.strToBytes(name));
        this.write(offset + length, item.data.length, item.data);

        return length + item.data.length;
    }
}