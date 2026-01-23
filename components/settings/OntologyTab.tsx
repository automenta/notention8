import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettingsContext';
import { OntologyNode, OntologyAttribute } from '../../types';
import {
  addNode,
  deleteNode,
  renameNode,
  addAttribute,
  deleteAttribute,
  renameAttribute,
  mergeAttributes
} from '../../utils/ontologyHelpers';
import { TrashIcon, EditIcon, PlusIcon, FolderIcon, TagIcon, MergeIcon, SparklesIcon } from '../layout/icons';
import { Modal } from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { InputModal } from '../common/InputModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { IconButton } from '../common/IconButton';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const OntologyTab: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const { addToast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal State
  const [inputModal, setInputModal] = useState<{
      isOpen: boolean;
      title: string;
      label?: string;
      defaultValue?: string;
      onConfirm: (val: string) => void;
  }>({ isOpen: false, title: '', onConfirm: () => {} });

  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Merge state
  const [mergingAttr, setMergingAttr] = useState<{ nodeId: string, sourceKey: string } | null>(null);
  const [targetMergeKey, setTargetMergeKey] = useState<string>('');

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  // --- Actions ---

  const handleAddNode = (parentId: string | null) => {
      setInputModal({
          isOpen: true,
          title: "Add Node",
          label: "Node ID (Label will match ID initially)",
          onConfirm: (id) => {
              if (!id) return;
              const newNode: OntologyNode = { id, label: id };
              setSettings(prev => ({
                  ...prev,
                  ontology: addNode(prev.ontology, parentId, newNode)
              }));
              if (parentId) {
                  const newExpanded = new Set(expandedNodes);
                  newExpanded.add(parentId);
                  setExpandedNodes(newExpanded);
              }
          }
      });
  };

  const handleDeleteNode = (id: string) => {
      setConfirmModal({
          isOpen: true,
          title: "Delete Node",
          message: "Are you sure you want to delete this node and all its children?",
          onConfirm: () => {
              setSettings(prev => ({
                  ...prev,
                  ontology: deleteNode(prev.ontology, id)
              }));
          }
      });
  };

  const handleRenameNode = (id: string, currentLabel: string) => {
      setInputModal({
          isOpen: true,
          title: "Rename Node",
          label: "New Label",
          defaultValue: currentLabel,
          onConfirm: (newLabel) => {
              if (newLabel && newLabel !== currentLabel) {
                  setSettings(prev => ({
                      ...prev,
                      ontology: renameNode(prev.ontology, id, newLabel)
                  }));
              }
          }
      });
  };

  const handleAddAttribute = (nodeId: string) => {
      setInputModal({
          isOpen: true,
          title: "Add Attribute",
          label: "Attribute Key",
          onConfirm: (key) => {
              if (!key) return;
              const newAttr: OntologyAttribute = {
                  type: 'string',
                  description: '',
                  operators: { real: ['is'], imaginary: ['is not'] }
              };
              setSettings(prev => ({
                  ...prev,
                  ontology: addAttribute(prev.ontology, nodeId, key, newAttr)
              }));
          }
      });
  };

  const handleDeleteAttribute = (nodeId: string, key: string) => {
      setConfirmModal({
          isOpen: true,
          title: "Delete Attribute",
          message: `Delete attribute '${key}'?`,
          onConfirm: () => {
              setSettings(prev => ({
                  ...prev,
                  ontology: deleteAttribute(prev.ontology, nodeId, key)
              }));
          }
      });
  };

  const handleRenameAttribute = (nodeId: string, oldKey: string) => {
      setInputModal({
          isOpen: true,
          title: "Rename Attribute",
          label: "New Key",
          defaultValue: oldKey,
          onConfirm: (newKey) => {
              if (newKey && newKey !== oldKey) {
                  try {
                      setSettings(prev => ({
                          ...prev,
                          ontology: renameAttribute(prev.ontology, nodeId, oldKey, newKey)
                      }));
                  } catch (e: unknown) {
                      const message = e instanceof Error ? e.message : String(e);
                      addToast(message, 'error');
                  }
              }
          }
      });
  };

  const handleMergeAttribute = (nodeId: string, sourceKey: string) => {
    setMergingAttr({ nodeId, sourceKey });
    setTargetMergeKey('');
  };

  const executeMerge = () => {
    if (!mergingAttr || !targetMergeKey) return;
    if (mergingAttr.sourceKey === targetMergeKey) {
        addToast("Source and target keys must be different.", 'error');
        return;
    }

    try {
        setSettings(prev => ({
            ...prev,
            ontology: mergeAttributes(prev.ontology, mergingAttr.nodeId, mergingAttr.sourceKey, targetMergeKey)
        }));
        addToast(`Merged '${mergingAttr.sourceKey}' into '${targetMergeKey}'`, 'success');
        setMergingAttr(null);
        setTargetMergeKey('');
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        addToast(message, 'error');
    }
  };

  // --- Rendering ---

  const renderNode = (node: OntologyNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const hasAttributes = node.attributes && Object.keys(node.attributes).length > 0;

    // Highlight Emergent Node
    const isEmergent = node.id === 'emergent';

    return (
      <li key={node.id} className="ml-4 border-l border-gray-700 pl-4 py-2">
        <div className="flex items-center gap-2 group">
          <button
            onClick={() => toggleExpand(node.id)}
            className={`p-1 rounded hover:bg-gray-700 ${!hasChildren && !hasAttributes ? 'invisible' : ''}`}
          >
            {isExpanded ? '▼' : '▶'}
          </button>

          {isEmergent ? <SparklesIcon className="w-5 h-5 text-purple-400" /> : <FolderIcon className="w-5 h-5 text-blue-400" />}
          <span className={`font-medium ${isEmergent ? 'text-purple-300' : 'text-gray-200'}`}>{node.label}</span>
          <span className="text-xs text-gray-500 font-mono">({node.id})</span>

          <div className="hidden group-hover:flex gap-1 ml-4">
             <IconButton
                onClick={() => handleRenameNode(node.id, node.label)}
                tooltip="Rename"
                icon={EditIcon}
                variant="ghost"
                size="xs"
                className="text-gray-400 hover:text-white"
             />
             <IconButton
                onClick={() => handleAddNode(node.id)}
                tooltip="Add Child"
                icon={PlusIcon}
                variant="ghost"
                size="xs"
                className="text-green-400 hover:text-green-300"
             />
             <IconButton
                onClick={() => handleDeleteNode(node.id)}
                tooltip="Delete"
                icon={TrashIcon}
                variant="ghost"
                size="xs"
                className="text-red-400 hover:text-red-300"
             />
             <IconButton
                onClick={() => handleAddAttribute(node.id)}
                tooltip="Add Attribute"
                icon={TagIcon}
                variant="ghost"
                size="xs"
                className="text-yellow-400 hover:text-yellow-300"
             />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2">
            {/* Attributes */}
            {node.attributes && Object.entries(node.attributes).map(([key, attr]) => (
                <div key={key} className="ml-8 flex items-center gap-2 py-1 group/attr">
                    <TagIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-300">{key}</span>
                    <span className="text-xs text-gray-500">({attr.type})</span>
                    {isEmergent && <span className="text-xs text-purple-400 border border-purple-500/50 px-1 rounded">inferred</span>}

                    <div className="hidden group-hover/attr:flex gap-1 ml-4">
                        <IconButton
                            onClick={() => handleRenameAttribute(node.id, key)}
                            tooltip="Rename"
                            icon={EditIcon}
                            variant="ghost"
                            size="xs"
                            className="text-gray-400 hover:text-white"
                        />
                        <IconButton
                            onClick={() => handleMergeAttribute(node.id, key)}
                            tooltip="Merge/Alias (Conflict Resolution)"
                            icon={MergeIcon}
                            variant="ghost"
                            size="xs"
                            className="text-purple-400 hover:text-purple-300"
                        />
                         <IconButton
                            onClick={() => handleDeleteAttribute(node.id, key)}
                            tooltip="Delete"
                            icon={TrashIcon}
                            variant="ghost"
                            size="xs"
                            className="text-red-400 hover:text-red-300"
                        />
                    </div>
                </div>
            ))}

            {/* Children */}
            {hasChildren && (
                <ul className="mt-2">
                    {node.children!.map(child => renderNode(child))}
                </ul>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="p-4 bg-gray-900/50 rounded-lg text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Ontology Graph</h2>
        <Button
            onClick={() => handleAddNode(null)}
            variant="primary"
            icon={PlusIcon}
            size="sm"
        >
            Add Root Node
        </Button>
      </div>
      <p className="text-gray-400 mb-4 text-xs">
        Manage the semantic structure of your network.
        Use <b>Merge</b> to resolve conflicts (aliasing attributes).
        <br/>
        <span className="text-purple-400 flex items-center gap-1 mt-1"><SparklesIcon className="w-3 h-3"/> Emergent nodes are automatically learned from the network.</span>
      </p>

      <ul>
        {settings.ontology.map(node => renderNode(node))}
      </ul>

      {mergingAttr && (
        <Modal
            isOpen={true}
            onClose={() => setMergingAttr(null)}
            title={`Merge Attribute '${mergingAttr.sourceKey}'`}
        >
            <div className="space-y-4">
                <p className="text-gray-300">
                    Select the target attribute to merge <b>{mergingAttr.sourceKey}</b> into.
                    This will delete <b>{mergingAttr.sourceKey}</b> and alias it to the target.
                </p>
                <div>
                    <Input
                        label="Target Attribute Key"
                        value={targetMergeKey}
                        onChange={(e) => setTargetMergeKey(e.target.value)}
                        placeholder="e.g. 'price'"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        onClick={() => setMergingAttr(null)}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={executeMerge}
                        disabled={!targetMergeKey}
                        variant="primary"
                    >
                        Merge Attributes
                    </Button>
                </div>
                <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700/50">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Upcoming Feature: Voting</h4>
                    <p className="text-xs text-gray-400">
                        In a future update, you will be able to propose this merge to the network and vote on shared definitions.
                    </p>
                </div>
            </div>
        </Modal>
      )}

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={inputModal.onConfirm}
        title={inputModal.title}
        label={inputModal.label}
        defaultValue={inputModal.defaultValue}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive
      />
    </div>
  );
};
