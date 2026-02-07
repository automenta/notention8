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
import { TrashIcon, EditIcon, PlusIcon, FolderIcon, TagIcon, MergeIcon } from '../icons';

export const OntologyTab: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingAttrKey, setEditingAttrKey] = useState<{ nodeId: string, key: string } | null>(null);

  // Merge state
  const [mergingAttr, setMergingAttr] = useState<{ nodeId: string, sourceKey: string } | null>(null);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  // --- Actions ---

  const handleAddNode = (parentId: string | null) => {
    const id = prompt('Enter new node ID:');
    if (!id) return;
    const label = prompt('Enter node label:', id);
    if (!label) return;

    const newNode: OntologyNode = { id, label };
    setSettings(prev => ({
      ...prev,
      ontology: addNode(prev.ontology, parentId, newNode)
    }));
    if (parentId) {
        const newExpanded = new Set(expandedNodes);
        newExpanded.add(parentId);
        setExpandedNodes(newExpanded);
    }
  };

  const handleDeleteNode = (id: string) => {
    if (!confirm('Are you sure you want to delete this node and all its children?')) return;
    setSettings(prev => ({
      ...prev,
      ontology: deleteNode(prev.ontology, id)
    }));
  };

  const handleRenameNode = (id: string, currentLabel: string) => {
    const newLabel = prompt('Enter new label:', currentLabel);
    if (newLabel && newLabel !== currentLabel) {
      setSettings(prev => ({
        ...prev,
        ontology: renameNode(prev.ontology, id, newLabel)
      }));
    }
  };

  const handleAddAttribute = (nodeId: string) => {
    const key = prompt('Enter attribute key:');
    if (!key) return;

    // Default attribute structure
    const newAttr: OntologyAttribute = {
        type: 'string',
        description: '',
        operators: { real: ['is'], imaginary: ['is not'] }
    };

    setSettings(prev => ({
      ...prev,
      ontology: addAttribute(prev.ontology, nodeId, key, newAttr)
    }));
  };

  const handleDeleteAttribute = (nodeId: string, key: string) => {
    if (!confirm(`Delete attribute '${key}'?`)) return;
    setSettings(prev => ({
      ...prev,
      ontology: deleteAttribute(prev.ontology, nodeId, key)
    }));
  };

  const handleRenameAttribute = (nodeId: string, oldKey: string) => {
    const newKey = prompt('Enter new key:', oldKey);
    if (newKey && newKey !== oldKey) {
        try {
            setSettings(prev => ({
                ...prev,
                ontology: renameAttribute(prev.ontology, nodeId, oldKey, newKey)
            }));
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  const handleMergeAttribute = (nodeId: string, sourceKey: string) => {
    const targetKey = prompt(`Merge '${sourceKey}' into which attribute? (Enter target key)`);
    if (!targetKey) return;
    if (sourceKey === targetKey) return;

    try {
        setSettings(prev => ({
            ...prev,
            ontology: mergeAttributes(prev.ontology, nodeId, sourceKey, targetKey)
        }));
    } catch (e: any) {
        alert(e.message);
    }
  };

  // --- Rendering ---

  const renderNode = (node: OntologyNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const hasAttributes = node.attributes && Object.keys(node.attributes).length > 0;

    return (
      <li key={node.id} className="ml-4 border-l border-gray-700 pl-4 py-2">
        <div className="flex items-center gap-2 group">
          <button
            onClick={() => toggleExpand(node.id)}
            className={`p-1 rounded hover:bg-gray-700 ${!hasChildren && !hasAttributes ? 'invisible' : ''}`}
          >
            {isExpanded ? '▼' : '▶'}
          </button>

          <FolderIcon className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-gray-200">{node.label}</span>
          <span className="text-xs text-gray-500 font-mono">({node.id})</span>

          <div className="hidden group-hover:flex gap-2 ml-4">
            <button onClick={() => handleRenameNode(node.id, node.label)} title="Rename">
                <EditIcon className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button onClick={() => handleAddNode(node.id)} title="Add Child">
                <PlusIcon className="w-4 h-4 text-green-400 hover:text-green-300" />
            </button>
            <button onClick={() => handleDeleteNode(node.id)} title="Delete">
                <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
            </button>
            <button onClick={() => handleAddAttribute(node.id)} title="Add Attribute">
                <TagIcon className="w-4 h-4 text-yellow-400 hover:text-yellow-300" />
            </button>
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

                    <div className="hidden group-hover/attr:flex gap-2 ml-4">
                        <button onClick={() => handleRenameAttribute(node.id, key)} title="Rename">
                            <EditIcon className="w-3 h-3 text-gray-400 hover:text-white" />
                        </button>
                        <button onClick={() => handleMergeAttribute(node.id, key)} title="Merge/Alias (Conflict Resolution)">
                            <MergeIcon className="w-3 h-3 text-purple-400 hover:text-purple-300" />
                        </button>
                        <button onClick={() => handleDeleteAttribute(node.id, key)} title="Delete">
                            <TrashIcon className="w-3 h-3 text-red-400 hover:text-red-300" />
                        </button>
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
        <button
            onClick={() => handleAddNode(null)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
        >
            <PlusIcon className="w-4 h-4" /> Add Root Node
        </button>
      </div>
      <p className="text-gray-400 mb-4 text-xs">
        Manage the semantic structure of your network.
        Use <b>Merge</b> to resolve conflicts (aliasing attributes).
      </p>

      <ul>
        {settings.ontology.map(node => renderNode(node))}
      </ul>
    </div>
  );
};
