"use client";

import { useMemo } from "react";
import { useEditor } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlock from "@tiptap/extension-code-block";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { getRealtimeWsBase } from "../../services/realtimeClient";
import { BlockIdExtension } from "../document/BlockIdExtension";

type UseCollaborativeEditorOptions = {
  documentId: string;
  userId: string;
  userName: string;
};

export function useCollaborativeEditor(options: UseCollaborativeEditorOptions) {
  const yDoc = useMemo(() => new Y.Doc(), []);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: `${getRealtimeWsBase()}?userId=${encodeURIComponent(options.userId)}&name=${encodeURIComponent(options.userName)}`,
        name: options.documentId,
        document: yDoc
      }),
    [options.documentId, options.userId, options.userName, yDoc]
  );

  const editor = useEditor({
    extensions: [
      BlockIdExtension,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Collaboration.configure({ document: yDoc }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: options.userName,
          color: "#60a5fa"
        }
      })
    ],
    content: ""
  });

  return {
    editor,
    provider
  };
}
