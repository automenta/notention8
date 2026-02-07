import React from 'react';
import type { Editor } from '@tiptap/react';

interface EditorStatusBarProps {
  editor: Editor | null;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({ editor }) => {
  if (!editor) return null;

  const text = editor.getText();
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = text.length;

  return (
    <div className="flex-shrink-0 px-4 py-1 bg-gray-900 border-t border-gray-700/50 text-xs text-gray-500 flex items-center justify-end gap-4 font-mono">
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
  );
};
