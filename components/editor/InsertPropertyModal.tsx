import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TagIcon, CheckIcon, InformationCircleIcon, ICON_MAP } from '../icons';
import type { OntologyAttribute } from '../../types';

interface InsertPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (key: string, operator: string, value: string, icon?: string) => void;
  initialKey?: string;
  attributeDef?: OntologyAttribute;
}

export const InsertPropertyModal: React.FC<InsertPropertyModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialKey = '',
  attributeDef
}) => {
  const [key, setKey] = useState(initialKey);
  const [operator, setOperator] = useState('is');
  const [value, setValue] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setKey(initialKey || '');
      setOperator('is');
      setValue('');
    }
  }, [isOpen, initialKey, attributeDef]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    onInsert(key.trim(), operator, value.trim(), attributeDef?.icon);
    onClose();
  };

  const preview = key && value ? `[${key}:${operator}:${value}]` : '...';

  const renderValueInput = () => {
    if (attributeDef?.type === 'enum' && attributeDef.options) {
      return (
        <select
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!attributeDef}
        >
          <option value="">Select an option...</option>
          {attributeDef.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (attributeDef?.type === 'date') {
      return (
        <input
          type="date"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!attributeDef}
        />
      );
    }

    if (attributeDef?.type === 'number') {
      return (
        <input
          type="number"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          placeholder="e.g. 100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!attributeDef}
        />
      );
    }

    return (
      <input
        type="text"
        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
        placeholder={
          attributeDef?.description
            ? `e.g. for ${attributeDef.description}`
            : 'e.g. Active, 100, 2024-01-01'
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={!!attributeDef}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Property">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-400">
          Properties make your note machine-readable and searchable.
        </p>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
            {attributeDef?.icon && ICON_MAP[attributeDef.icon] && React.createElement(ICON_MAP[attributeDef.icon], { className: "w-4 h-4 text-blue-400" })}
            Key
          </label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
            placeholder="e.g. status, price, deadline"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            // Auto focus only if no attribute def (meaning we typed custom key or it's generic open)
            // But actually we might want to edit key even if prefilled? Usually prefilled from "Missing" means we want that key.
            autoFocus={!attributeDef}
          />
          {attributeDef?.description && (
             <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                 <InformationCircleIcon className="w-3 h-3" />
                 {attributeDef.description}
             </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Operator
          </label>
          <select
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 focus:border-blue-500 outline-none"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
          >
            <option value="is">is (=)</option>
            <option value="is not">is not (!=)</option>
            <option value="greater than">greater than (&gt;)</option>
            <option value="less than">less than (&lt;)</option>
            <option value="contains">contains</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Value
          </label>
          {renderValueInput()}
        </div>

        <div className="bg-gray-900/50 p-3 rounded border border-gray-700/50 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase">Preview</span>
          <code className="text-blue-400 font-mono text-sm">{preview}</code>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!key.trim() || !value.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TagIcon className="w-4 h-4" />
            Insert
          </button>
        </div>
      </form>
    </Modal>
  );
};
