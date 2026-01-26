import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Note, OntologyNode, Template } from '../../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../../utils/sanitize';
import { formatHtmlForDisplay } from '../../utils/editor';
import { useTiptapConfig } from './useTiptapConfig';
import { useView } from '../../hooks/useViewContext';
import { useToast } from '../contexts/ToastContext';
import { EditorStatusBar } from './EditorStatusBar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { InsertPropertyModal } from './InsertPropertyModal';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
  ontology: OntologyNode[];
  templates?: Template[];
  minimal?: boolean;
  showToolbar?: boolean;
  onMagic?: () => void;
  onTemplates?: () => void;
  notes?: Note[];
  onPickLocation?: () => Promise<string>;
}

export interface TiptapEditorRef {
    openPropertyModal: (key?: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({
  note,
  onSave,
  ontology,
  templates,
  minimal = false,
  showToolbar = true,
  onMagic,
  onTemplates,
  notes = [],
  onPickLocation
}, ref) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyPos, setEditingPropertyPos] = useState<number | null>(null);
  const [initialModalData, setInitialModalData] = useState<{
    key: string;
    operator: string;
    value: string;
    icon?: string;
  } | undefined>(undefined);

  const { setSearchTerm, setActiveView, setSelectedNoteId } = useView();
  const { addToast } = useToast();

  const handleOpenPropertyModal = useCallback((key?: string) => {
      setInitialModalData(key ? { key, operator: 'is', value: '' } : undefined);
      setIsPropertyModalOpen(true);
  }, []);

  useImperativeHandle(ref, () => ({
      openPropertyModal: handleOpenPropertyModal
  }));

  const editor = useTiptapConfig({
      content: note.content,
      onUpdate: onSave,
      ontology,
      templates,
      minimal,
      notes,
      onOpenPropertyModal: handleOpenPropertyModal
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== note.content) {
      editor.commands.setContent(sanitizeHTML(note.content), false);
    }
  }, [note.content, editor]);

  const toggleViewMode = () => {
    if (viewMode === 'code' && editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(sanitizeHTML(note.content), false);
    }
    setViewMode((prev) => (prev === 'rich' ? 'code' : 'rich'));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSave(e.target.value.replace(/\n/g, ''));
  };

  const handleInsertProperty = (key: string, operator: string, value: string, icon?: string) => {
    if (editor) {
      if (editingPropertyPos !== null) {
          // Replace existing node
          editor.chain().focus().setNodeSelection(editingPropertyPos).deleteSelection().insertContent({
              type: 'property',
              attrs: {
                  name: key,
                  operator: operator,
                  value: value,
                  icon: icon,
              },
          }).run();
      } else {
          // Insert new
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'property',
              attrs: {
                name: key,
                operator: operator,
                value: value,
                icon: icon,
              },
            })
            .insertContent(' ')
            .run();
      }
    }
    setIsPropertyModalOpen(false);
    setEditingPropertyPos(null);
    setInitialModalData(undefined);
  };

  const findAttributeDef = (key: string, nodes: OntologyNode[]): any => {
      for (const node of nodes) {
        if (node.attributes && node.attributes[key]) {
          return node.attributes[key];
        }
        if (node.children) {
          const found = findAttributeDef(key, node.children);
          if (found) return found;
        }
      }
      return undefined;
  };

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicked inside a property node
      const propertyNode = target.closest('.node-property');
      if (propertyNode && editor) {
          e.preventDefault();
          e.stopPropagation();

          // Find the pos of the clicked node
          const pos = editor.view.posAtDOM(propertyNode, 0);
          if (pos < 0) return;

          // Since posAtDOM might return position inside the node, we might need to resolve to the node pos.
          // For atom nodes, usually the pos returned is fine or we use `resolve`.
          // But actually, we need the node itself to get attrs.
          const $pos = editor.state.doc.resolve(pos);
          const node = editor.state.doc.nodeAt($pos.before(1)); // This is tricky depending on structure.

          // Safer way: search around the click position for a property node.
          // editor.view.posAtDOM(target, 0) gives pos before the element if it's a leaf?

          // Let's rely on Tiptap's built-in selection or just probe.
          // Actually, ReactNodeViewWrapper renders inside the node.

          // Let's use `editor.view.posAtDOM`
          // propertyNode is the wrapper div.
          // The actual ProseMirror node starts at some position.
          const domPos = editor.view.posAtDOM(propertyNode, 0);

          // There is a potential off-by-one or depth issue.
          // Let's try to find the node at this position.
          // We can try to select it.
          const resolved = editor.state.doc.resolve(domPos);
          // Check if nodeAfter is the property?
          const nodeAfter = resolved.nodeAfter;
          const nodeBefore = resolved.nodeBefore;

          let targetNode = null;
          let targetPos = -1;

          if (nodeAfter && nodeAfter.type.name === 'property') {
              targetNode = nodeAfter;
              targetPos = domPos;
          } else if (nodeBefore && nodeBefore.type.name === 'property') {
               // This happens if we clicked at the end of it?
               targetNode = nodeBefore;
               targetPos = resolved.pos - nodeBefore.nodeSize;
          } else {
              // Try parent?
              const parent = resolved.parent;
              if (parent && parent.type.name === 'property') {
                   // This shouldn't happen for inline nodes usually unless we are deep inside?
                   // But property is inline atom.
              }
          }

          // If the propertyNode is the content of the node view, posAtDOM returns the position inside the node view.
          // But since it's an atom node, it shouldn't have content in PM model sense (it has in React sense).
          // Tiptap's `getPos` prop in NodeView is the best way, but we are in the parent component.

          // Let's simplify: if we click it, we can update selection to it and then read selection.
          // But clicking might not update selection to the node if we use e.preventDefault().

          // Let's blindly trust posAtDOM to point to the start of the node if we pass the wrapper.
          // Actually `posAtDOM` is notoriously tricky with NodeViews.

          // Alternative: We can use the logic from `PropertyChip` to trigger an event?
          // But `PropertyChip` is isolated.

          // Let's try `editor.getAttributes('property')`?
          // That only works if selection is inside/on it.

          // If we allow default behavior, Tiptap might select it.
          // But we want to open modal.

          // Let's try to assume selection is updated on click or force it.
          // But we prevented default.

          // Let's try finding the node by searching from the click pos.
          // A naive but often effective way:
          // editor.view.posAtCoords({ left: e.clientX, top: e.clientY })
          const coords = { left: e.clientX, top: e.clientY };
          const posInfo = editor.view.posAtCoords(coords);
          if (posInfo) {
              const { pos } = posInfo;
              const $pos = editor.state.doc.resolve(pos);
              const node = $pos.nodeAfter || $pos.nodeBefore; // Rough check
              // Better: check specific node at pos
              // For atom inline nodes, the pos might be directly before it.

              // Let's iterate nearby nodes?
              // Or use `nodeAt`.
              const nodeAt = editor.state.doc.nodeAt(pos);
              if (nodeAt && nodeAt.type.name === 'property') {
                  setEditingPropertyPos(pos);
                  setInitialModalData({
                      key: nodeAt.attrs.name,
                      operator: nodeAt.attrs.operator,
                      value: nodeAt.attrs.value,
                      icon: nodeAt.attrs.icon
                  });
                  setIsPropertyModalOpen(true);
                  return;
              }
              // Check before (if we clicked right side)
              const nodeBefore = editor.state.doc.nodeAt(pos - 1);
              if (nodeBefore && nodeBefore.type.name === 'property') {
                   setEditingPropertyPos(pos - 1);
                   setInitialModalData({
                      key: nodeBefore.attrs.name,
                      operator: nodeBefore.attrs.operator,
                      value: nodeBefore.attrs.value,
                      icon: nodeBefore.attrs.icon
                   });
                   setIsPropertyModalOpen(true);
                   return;
              }
          }
      }

      // Handle both tags and properties (which are also searchable)
      // Note: we removed preventing default for tags to allow cursor placement nearby?
      // No, for tags in suggestion list, they are buttons/items.
      // But if we have tags in the text as links? No, we use `suggestion-tag` class for mentions.

      if (target.classList.contains('suggestion-tag') || target.classList.contains('suggestion-item')) {
          e.preventDefault();
          const text = target.innerText;

          // For tags, ensure '#' prefix. For properties, use as is.
          const searchTerm = target.classList.contains('suggestion-tag') && !text.startsWith('#')
            ? `#${text}`
            : text;

          setSearchTerm(searchTerm);
          setActiveView('notes');
          addToast(`Filtered by ${searchTerm}`, 'info');
      }

      // Handle Note Links
      if (target.classList.contains('suggestion-note')) {
          e.preventDefault();
          const noteId = target.getAttribute('data-id');
          if (noteId) {
              setSelectedNoteId(noteId);
              setActiveView('notes');
          }
      }
  }, [setSearchTerm, setActiveView, addToast, setSelectedNoteId, editor]);

  return (
    <div className="flex flex-col h-full">
      {!minimal && showToolbar && (
        <TiptapToolbar
          editor={editor}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onMagic={onMagic}
          onTemplates={onTemplates}
          onInsertProperty={() => {
              setEditingPropertyPos(null);
              setInitialModalData(undefined);
              setIsPropertyModalOpen(true);
          }}
        />
      )}
      <InsertPropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
            setIsPropertyModalOpen(false);
            setEditingPropertyPos(null);
            setInitialModalData(undefined);
        }}
        onInsert={handleInsertProperty}
        initialKey={initialModalData?.key}
        initialOperator={initialModalData?.operator}
        initialValue={initialModalData?.value}
        attributeDef={initialModalData?.key ? findAttributeDef(initialModalData.key, ontology) : undefined}
        ontology={ontology}
        isEditing={editingPropertyPos !== null}
        onPickLocation={onPickLocation}
      />
      <div className="flex-grow overflow-y-auto" onClick={handleEditorClick}>
        {viewMode === 'rich' ? (
          <>
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
          </>
        ) : (
          <textarea
            className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono focus:outline-none resize-none"
            value={formatHtmlForDisplay(note.content)}
            onChange={handleCodeChange}
            placeholder="Enter HTML..."
          />
        )}
      </div>
      {!minimal && <EditorStatusBar editor={editor} />}
    </div>
  );
});
