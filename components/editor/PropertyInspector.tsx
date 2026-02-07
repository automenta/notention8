import React, { useState, useEffect } from 'react';
import type { Property } from '../../types';
import { TagIcon, PlusIcon, TrashIcon, CheckIcon, XIcon } from '../icons';

interface PropertyInspectorProps {
  properties: Property[];
  onPropertyChange: (newProperties: Property[]) => void;
  // We need a way to insert into text, but for now we might just update the parsed structure
  // and let the parent handle text insertion/replacement?
  // Actually, EditorManager parses *from* text. If we update property here, we must update text.
  // This is tricky.
  // Let's assume we pass a callback that knows how to replace/append text.
  onUpdateText: (oldProp: Property | null, newProp: Property) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  properties,
  onUpdateText
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newOp, setNewOp] = useState('is');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey || !newValue) return;
    const newProp: Property = {
        key: newKey,
        operator: newOp,
        values: [newValue]
    };
    onUpdateText(null, newProp);
    setIsAdding(false);
    setNewKey('');
    setNewValue('');
    setNewOp('is');
  };

  const handleRemove = (prop: Property) => {
      // Logic to remove property from text
      // We assume onUpdateText with null newProp means delete
      // Wait, onUpdateText signature: (old, new). If new is null?
      // Let's clarify signature in usage.
  };

  return (
    <div className="bg-gray-900 border-l border-gray-700/50 w-64 flex-shrink-0 flex flex-col h-full">
        <div className="p-3 border-b border-gray-700 font-semibold text-gray-300 flex justify-between items-center">
            <span>Properties</span>
            <button
                onClick={() => setIsAdding(true)}
                className="p-1 hover:bg-gray-800 rounded text-blue-400"
                title="Add Property"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {isAdding && (
                <div className="bg-gray-800 p-2 rounded border border-blue-500/50 space-y-2 animate-fade-in">
                    <input
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500"
                        placeholder="Key (e.g. price)"
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}
                        autoFocus
                    />
                    <select
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
                        value={newOp}
                        onChange={e => setNewOp(e.target.value)}
                    >
                        <option value="is">is (=)</option>
                        <option value="is not">is not (!=)</option>
                        <option value="greater than">greater than (&gt;)</option>
                        <option value="less than">less than (&lt;)</option>
                        <option value="contains">contains</option>
                    </select>
                    <input
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500"
                        placeholder="Value"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><XIcon className="w-4 h-4"/></button>
                        <button onClick={handleAdd} className="text-green-500 hover:text-green-400"><CheckIcon className="w-4 h-4"/></button>
                    </div>
                </div>
            )}

            {properties.map((prop, idx) => (
                <div key={idx} className="bg-gray-800/50 p-2 rounded border border-gray-700 hover:border-gray-500 group relative">
                    <div className="text-xs text-blue-400 font-mono mb-1">{prop.key}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                        <span className="text-gray-500 text-xs">{prop.operator === 'is' ? '=' : prop.operator}</span>
                        <span>{prop.values.join(', ')}</span>
                    </div>
                </div>
            ))}

            {properties.length === 0 && !isAdding && (
                <div className="text-center text-gray-500 text-sm py-4">
                    No properties detected.
                    <br/>
                    Type <code>[key:val]</code> or click +
                </div>
            )}
        </div>
    </div>
  );
};
