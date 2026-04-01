import type { Editor } from "@tiptap/react";
import type { SuggestionDiff } from "@akshar/contracts";

type PositionedBlock = {
  from: number;
  to: number;
};

export function applySuggestionDiff(editor: Editor, suggestion: SuggestionDiff): void {
  const baseState = editor.state;
  let transaction = baseState.tr;

  suggestion.operations.forEach((operation: SuggestionDiff["operations"][number]) => {
    const position = findBlockPosition(transaction.doc, operation.targetBlockId);
    if (!position) {
      return;
    }

    if (operation.operation === "delete") {
      transaction = transaction.delete(position.from, position.to);
      return;
    }

    if (operation.operation === "insert") {
      if (!operation.content) {
        return;
      }
      transaction = transaction.insertText(operation.content, position.to - 1);
      return;
    }

    if (operation.operation === "replace") {
      if (!operation.content) {
        return;
      }
      transaction = transaction.insertText(operation.content, position.from, position.to);
    }
  });

  if (transaction.docChanged) {
    editor.view.dispatch(transaction);
  }
}

type DocNode = {
  descendants: (callback: (node: { attrs: Record<string, unknown>; nodeSize: number }, pos: number) => void) => void;
};

function findBlockPosition(doc: DocNode, targetBlockId: string): PositionedBlock | null {
  let located: PositionedBlock | null = null;

  doc.descendants((node, pos) => {
    if (located) {
      return;
    }

    const blockId = node.attrs.blockId;
    if (typeof blockId !== "string" || blockId !== targetBlockId) {
      return;
    }

    located = {
      from: pos + 1,
      to: pos + node.nodeSize - 1
    };
  });

  return located;
}
