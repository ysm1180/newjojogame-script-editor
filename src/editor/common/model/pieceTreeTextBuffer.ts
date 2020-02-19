import { PieceTreeBase, StringBuffer } from './pieceTreeBase';

import { ITextBuffer } from '../models';

export class PieceTreeTextBuffer implements ITextBuffer {
  private pieceTree: PieceTreeBase;

  constructor(chunks: StringBuffer[]) {
    this.pieceTree = new PieceTreeBase(chunks);
  }

  public getLength(): number {
    return this.pieceTree.getLength();
  }

  public getLineCount(): number {
    return this.pieceTree.getLineCount();
  }

  public getLinesContent(): string[] {
    return this.pieceTree.getLinesContent();
  }

  public getLineContent(lineNumber: number): string {
    return this.pieceTree.getLineContent(lineNumber);
  }
}
