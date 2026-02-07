import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TagIcon, CheckIcon } from '../icons';

interface InsertPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (key: string, operator: string, value: string) => void;
  initialKey?: string;
}

export const InsertPropertyModal: React.FC<InsertPropertyModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialKey = ''
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
  }, [isOpen, initialKey]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    onInsert(key.trim(), operator, value.trim());
    onClose();
  };

  const preview = key && value ? `[${key}:${operator}:${value}]` : '...';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Property">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-400">
            Properties make your note machine-readable and searchable.
        </p>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Key
          </label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
            placeholder="e.g. status, price, deadline"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
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
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
            placeholder="e.g. Active, 100, 2024-01-01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
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
