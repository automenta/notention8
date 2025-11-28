import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
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
} from './icons'; // Assuming icons are available

interface TiptapToolbarProps {
  editor: Editor | null;
  viewMode: 'rich' | 'code';
  toggleViewMode: () => void;
}

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  viewMode,
  toggleViewMode,
}) => {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'hover:bg-gray-700/80 text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <BoldIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <ItalicIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive('underline'))}
        title="Underline"
      >
        <UnderlineIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <StrikethroughIcon className="h-5 w-5" />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1Icon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2Icon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3Icon className="h-5 w-5" />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <ListUlIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOlIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <QuoteIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <CodeBlockIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <HorizontalRuleIcon className="h-5 w-5" />
      </button>

      <div className="flex-grow"></div>

      <button
        onClick={toggleViewMode}
        className={buttonClass(viewMode === 'code')}
        title="Toggle Code View"
      >
        <CodeBracketsIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
