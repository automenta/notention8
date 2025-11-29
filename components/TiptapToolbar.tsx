import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListUlIcon,
  ListOlIcon,
  QuoteIcon,
  CodeBlockIcon,
  CodeBracketsIcon,
  HorizontalRuleIcon,
} from './icons';

interface TiptapToolbarProps {
  editor: Editor | null;
  viewMode: 'rich' | 'code';
  toggleViewMode: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  title,
  icon: Icon,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'hover:bg-gray-700/80 text-gray-400 hover:text-gray-200'
    }`}
    title={title}
  >
    <Icon className="h-5 w-5" />
  </button>
);

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  viewMode,
  toggleViewMode,
}) => {
  if (!editor) return null;

  return (
    <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center flex-wrap gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
        icon={BoldIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
        icon={ItalicIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
        icon={StrikethroughIcon}
      />

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        icon={Heading1Icon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        icon={Heading2Icon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
        icon={Heading3Icon}
      />

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
        icon={ListUlIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
        icon={ListOlIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
        icon={QuoteIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
        icon={CodeBlockIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
        icon={HorizontalRuleIcon}
      />

      <div className="flex-grow"></div>

      <ToolbarButton
        onClick={toggleViewMode}
        isActive={viewMode === 'code'}
        title="Toggle Code View"
        icon={CodeBracketsIcon}
      />
    </div>
  );
};
