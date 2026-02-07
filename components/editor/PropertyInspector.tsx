import React, { useState } from 'react';

import type { Property } from '../../types';
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XIcon,
  MapPinIcon,
} from '../icons';

interface PropertyInspectorProps {
  properties: Property[];
  onPropertyChange: (newProperties: Property[]) => void;
  onUpdateText: (oldProp: Property | null, newProp: Property | null) => void;
  onPickLocation?: () => void;
}

export function PropertyInspector({
  properties,
  onUpdateText,
  onPickLocation,
}: PropertyInspectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editKey, setEditKey] = useState('');
  const [editOp, setEditOp] = useState('is');
  const [editValue, setEditValue] = useState('');

  const startAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setEditKey('');
    setEditOp('is');
    setEditValue('');
  };

  const startEdit = (prop: Property, idx: number) => {
    setIsAdding(false);
    setEditingIndex(idx);
    setEditKey(prop.key);
    setEditOp(prop.operator);
    setEditValue(prop.values.join(', '));
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!editKey || !editValue) return;
    const newProp: Property = {
      key: editKey,
      operator: editOp,
      values: editValue.split(',').map((v) => v.trim()),
    };

    if (editingIndex !== null) {
      // Edit existing
      const oldProp = properties[editingIndex];
      onUpdateText(oldProp, newProp);
    } else {
      // Add new
      onUpdateText(null, newProp);
    }

    cancelEdit();
  };

  const handleDelete = (prop: Property) => {
    if (confirm(`Delete property [${prop.key}]?`)) {
      onUpdateText(prop, null);
    }
  };

  return (
    <div className="bg-gray-900 border-l border-gray-700/50 w-72 flex-shrink-0 flex flex-col h-full transition-all duration-300">
      <div className="p-3 border-b border-gray-700 font-semibold text-gray-300 flex justify-between items-center bg-gray-800/30">
        <span className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-blue-500" />
          Properties
        </span>
        <button
          onClick={startAdd}
          className="p-1.5 hover:bg-blue-900/50 rounded-md text-blue-400 transition-colors"
          title="Add Property"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {(isAdding || editingIndex !== null) && (
          <div className="bg-gray-800 p-3 rounded-md border border-blue-500/50 space-y-3 animate-fade-in shadow-lg">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex justify-between items-center">
              <span>{isAdding ? 'New Property' : 'Edit Property'}</span>
              {onPickLocation && (editKey === 'location' || editKey === '') && (
                  <button onClick={onPickLocation} className='text-xs text-blue-300 hover:text-white flex items-center gap-1 bg-blue-900/30 px-2 py-0.5 rounded'>
                      <MapPinIcon className="w-3 h-3" /> Pick
                  </button>
              )}
            </div>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Key (e.g. price)"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              autoFocus
            />
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300 focus:border-blue-500 outline-none"
              value={editOp}
              onChange={(e) => setEditOp(e.target.value)}
            >
              <option value="is">is (=)</option>
              <option value="is not">is not (!=)</option>
              <option value="greater than">greater than (&gt;)</option>
              <option value="less than">less than (&lt;)</option>
              <option value="contains">contains</option>
            </select>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              placeholder="Value (comma separated)"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={cancelEdit}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <XIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-1 text-green-500 hover:text-green-400 hover:bg-gray-700 rounded"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {properties.map((prop, idx) => (
          <div
            key={idx}
            className={`bg-gray-800/40 p-2 rounded border border-gray-700 hover:border-gray-600 group relative transition-all ${editingIndex === idx ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex justify-between items-start mb-1">
              <div
                className="text-xs text-blue-400 font-mono font-bold truncate pr-6"
                title={prop.key}
              >
                {prop.key}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded">
                <button
                  onClick={() => startEdit(prop, idx)}
                  className="p-1 hover:text-yellow-400 text-gray-400"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(prop)}
                  className="p-1 hover:text-red-400 text-gray-400"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-gray-500 text-xs font-mono bg-gray-900 px-1 rounded">
                {prop.operator === 'is' ? '=' : prop.operator}
              </span>
              <span className="truncate" title={prop.values.join(', ')}>
                {prop.values.join(', ')}
              </span>
            </div>
          </div>
        ))}

        {properties.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 text-sm py-8 flex flex-col items-center gap-2 opacity-60">
            <TagIcon className="w-8 h-8 mb-2" />
            <p>No properties detected.</p>
            <p className="text-xs">
              Type <code>[key:val]</code> in the editor or add one manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
