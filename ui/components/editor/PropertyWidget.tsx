import React from 'react';
import type { Property } from '@notention/core';
import { TrashIcon } from '../common/icons';

interface PropertyWidgetProps {
    property: Property;
    onChange: (property: Property) => void;
    onRemove: () => void;
}

const OPERATORS = ['is', 'contains', 'less than', 'greater than', 'is near'];

export function PropertyWidget({
  property,
  onChange,
  onRemove
}: PropertyWidgetProps) {
  // Simple type inference for widget display
  const isNumber = !isNaN(Number(property.values[0]));
  const isBoolean = property.values[0] === 'true' || property.values[0] === 'false';

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded mb-2 border border-gray-700/50">
      <span className="font-mono text-sm text-blue-300 min-w-[4rem]">{property.key}</span>

      <select
        value={property.operator}
        onChange={(e) => onChange({ ...property, operator: e.target.value })}
        className="bg-gray-900 text-xs rounded px-2 py-1 border border-gray-700"
      >
          {OPERATORS.map(op => (
              <option key={op} value={op}>{op}</option>
          ))}
      </select>

      <div className="flex-1">
        {isBoolean ? (
            <input
                type="checkbox"
                checked={property.values[0] === 'true'}
                onChange={(e) => onChange({ ...property, values: [e.target.checked.toString()] })}
            />
        ) : (
            <input
                type="text"
                value={property.values[0]}
                onChange={(e) => onChange({ ...property, values: [e.target.value] })}
                className="w-full bg-gray-900 text-sm rounded px-2 py-1 border border-gray-700"
            />
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-1 text-gray-500 hover:text-red-400"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
