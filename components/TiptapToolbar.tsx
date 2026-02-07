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
  SparklesIcon,
  CubeIcon,
} from './icons';

interface TiptapToolbarProps {
  editor: Editor | null;
  viewMode: 'rich' | 'code';
  toggleViewMode: () => void;
  onMagic?: () => void;
  onTemplates?: () => void;
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
    className={`p-1.5 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-blue-600/90 text-white shadow-sm'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
    title={title}
    aria-label={ariaLabel || title}
    aria-pressed={isActive}
    type="button"
  >
    <Icon className="h-4 w-4" />
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
  onMagic,
  onTemplates,
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
    <div className="flex-shrink-0 px-3 py-2 border-b border-gray-700/50 flex items-center flex-wrap gap-2 bg-gray-900/50 backdrop-blur-sm">
      {(onMagic || onTemplates) && (
        <div className="flex items-center gap-1 bg-purple-900/20 p-0.5 rounded-lg border border-purple-500/20">
            {onMagic && (
            <ToolbarButton
                onClick={onMagic}
                title="Magic Align (Auto-generate semantic properties)"
                icon={SparklesIcon}
                isActive={false}
            />
            )}
            {onTemplates && (
            <ToolbarButton
                onClick={onTemplates}
                title="Insert Template"
                icon={CubeIcon}
                isActive={false}
            />
            )}
        </div>
      )}

      <div className="flex items-center flex-wrap gap-0.5 flex-grow">
        {actions.map((item, index) => {
          if (item.type === 'separator') {
            return (
              <div
                key={`sep-${index}`}
                className="w-px h-4 bg-gray-700/50 mx-1.5 hidden sm:block"
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
      </div>

      <div className="border-l border-gray-700/50 pl-2 ml-1">
        <ToolbarButton
          onClick={toggleViewMode}
          isActive={viewMode === 'code'}
          title={
            viewMode === 'code' ? 'Switch to Rich Text' : 'Switch to HTML Code'
          }
          icon={CodeBracketsIcon}
        />
      </div>
    </div>
  );
};
