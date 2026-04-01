import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { Plugin, type EditorState, type Transaction } from "prosemirror-state";

const BLOCK_NODE_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "codeBlock", "listItem"];

export const BlockIdExtension = Extension.create({
  name: "blockId",

  addGlobalAttributes() {
    return [
      {
        types: BLOCK_NODE_TYPES,
        attributes: {
          blockId: {
            default: null
          }
        }
      }
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_transactions: readonly Transaction[], _oldState: EditorState, state: EditorState) => {
          let transaction = state.tr;
          let updated = false;

          state.doc.descendants((node: ProseMirrorNode, position: number) => {
            if (!BLOCK_NODE_TYPES.includes(node.type.name)) {
              return;
            }

            if (typeof node.attrs.blockId === "string" && node.attrs.blockId.length > 0) {
              return;
            }

            transaction = transaction.setNodeMarkup(position, undefined, {
              ...node.attrs,
              blockId: crypto.randomUUID()
            });
            updated = true;
          });

          return updated ? transaction : null;
        }
      })
    ];
  }
});
