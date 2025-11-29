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
  ariaLabel?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  title,
  icon: Icon,
  ariaLabel,
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
    aria-label={ariaLabel || title}
    aria-pressed={isActive}
    type="button"
  >
    <Icon className="h-5 w-5" />
  </button>
);

type ToolbarItem =
  | { type: 'separator' }
  | {
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      action: () => void;
      isActive?: () => boolean;
      disabled?: () => boolean;
      type?: undefined;
    };

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  viewMode,
  toggleViewMode,
}) => {
  if (!editor) return null;

  const actions: ToolbarItem[] = [
    {
      title: 'Bold',
      icon: BoldIcon,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      disabled: () => !editor.can().chain().focus().toggleBold().run(),
    },
    {
      title: 'Italic',
      icon: ItalicIcon,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      disabled: () => !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      title: 'Strikethrough',
      icon: StrikethroughIcon,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
      disabled: () => !editor.can().chain().focus().toggleStrike().run(),
    },
    { type: 'separator' },
    {
      title: 'Heading 1',
      icon: Heading1Icon,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      title: 'Heading 2',
      icon: Heading2Icon,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      title: 'Heading 3',
      icon: Heading3Icon,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    { type: 'separator' },
    {
      title: 'Bullet List',
      icon: ListUlIcon,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      title: 'Numbered List',
      icon: ListOlIcon,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      title: 'Blockquote',
      icon: QuoteIcon,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      title: 'Code Block',
      icon: CodeBlockIcon,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      title: 'Horizontal Rule',
      icon: HorizontalRuleIcon,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center flex-wrap gap-1">
      {actions.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div
              key={`sep-${index}`}
              className="w-px h-6 bg-gray-700 mx-1"
            ></div>
          );
        }
        return (
          <ToolbarButton
            key={item.title}
            onClick={item.action}
            disabled={item.disabled ? item.disabled() : false}
            isActive={item.isActive ? item.isActive() : false}
            title={item.title}
            icon={item.icon}
          />
        );
      })}

      <div className="flex-grow"></div>

      <ToolbarButton
        onClick={toggleViewMode}
        isActive={viewMode === 'code'}
        title={
          viewMode === 'code' ? 'Switch to Rich Text' : 'Switch to HTML Code'
        }
        icon={CodeBracketsIcon}
      />
    </div>
  );
};
