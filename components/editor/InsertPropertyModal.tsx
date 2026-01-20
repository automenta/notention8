import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { TagIcon, CheckIcon, InformationCircleIcon, ICON_MAP, MapIcon } from '../layout/icons';
import type { OntologyAttribute, OntologyNode } from '../../types';
import { findAttributeDef } from '../../utils/ontologyHelpers';

interface InsertPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (key: string, operator: string, value: string, icon?: string) => void;
  initialKey?: string;
  initialOperator?: string;
  initialValue?: string;
  attributeDef?: OntologyAttribute;
  ontology?: OntologyNode[];
  isEditing?: boolean;
  onPickLocation?: () => Promise<string>;
}

export const InsertPropertyModal: React.FC<InsertPropertyModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialKey = '',
  initialOperator = 'is',
  initialValue = '',
  attributeDef,
  ontology,
  isEditing = false,
  onPickLocation
}) => {
  const [key, setKey] = useState(initialKey);
  const [operator, setOperator] = useState(initialOperator);
  const [value, setValue] = useState(initialValue);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setKey(initialKey || '');
      setOperator(initialOperator || 'is');
      setValue(initialValue || '');
    }
  }, [isOpen, initialKey, initialOperator, initialValue, attributeDef]);

  const activeDef = useMemo(() => {
      if (ontology && key) {
          const found = findAttributeDef(key, ontology);
          if (found) return found;
      }
      return attributeDef;
  }, [key, ontology, attributeDef]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    onInsert(key.trim(), operator, value.trim(), activeDef?.icon);
    onClose();
  };

  const preview = key && value ? `[${key}:${operator}:${value}]` : '...';

  const renderValueInput = () => {
    if (activeDef?.type === 'enum' && activeDef.options) {
      return (
        <select
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!activeDef}
        >
          <option value="">Select an option...</option>
          {activeDef.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (activeDef?.type === 'date') {
      return (
        <input
          type="date"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!activeDef}
        />
      );
    }

    if (activeDef?.type === 'number') {
      return (
        <input
          type="number"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          placeholder="e.g. 100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!activeDef}
        />
      );
    }

    if (activeDef?.type === 'datetime') {
      return (
        <input
          type="datetime-local"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!activeDef}
        />
      );
    }

    if (activeDef?.type === 'boolean') {
      return (
        <select
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={!!activeDef}
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (activeDef?.type === 'geo') {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="lat,lng"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus={!!activeDef}
                />
                {onPickLocation && (
                    <button
                        type="button"
                        onClick={async () => {
                            const loc = await onPickLocation();
                            if (loc) setValue(loc);
                        }}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                        title="Pick from Map"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        );
    }

    return (
      <input
        type="text"
        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
        placeholder={
          activeDef?.description
            ? `e.g. for ${activeDef.description}`
            : 'e.g. Active, 100, 2024-01-01'
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={!!activeDef}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Property" : "Insert Property"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-400">
          Properties make your note machine-readable and searchable.
        </p>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
            {activeDef?.icon && ICON_MAP[activeDef.icon] && React.createElement(ICON_MAP[activeDef.icon], { className: "w-4 h-4 text-blue-400" })}
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
            autoFocus={!activeDef}
          />
          {activeDef?.description && (
             <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                 <InformationCircleIcon className="w-3 h-3" />
                 {activeDef.description}
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
            {isEditing ? "Update" : "Insert"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
