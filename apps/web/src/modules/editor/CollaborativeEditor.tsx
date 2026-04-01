"use client";

import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useCollaborativeEditor } from "./useCollaborativeEditor";

type CollaborativeEditorProps = {
  documentId: string;
  userId: string;
  userName: string;
  onEditorReady?: (editor: Editor) => void;
};

export function CollaborativeEditor({ documentId, userId, userName, onEditorReady }: CollaborativeEditorProps) {
  const { editor } = useCollaborativeEditor({ documentId, userId, userName });

  useEffect(() => {
    if (!editor || !onEditorReady) {
      return;
    }
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) {
    return <div className="editor">Loading editor...</div>;
  }

  return <EditorContent className="editor" editor={editor} />;
}
