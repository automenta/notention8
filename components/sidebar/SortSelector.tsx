import React from 'react';
import type { SortOrder } from '../../types';

interface SortSelectorProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  sortOrder,
  onSortChange,
}) => (
  <div className="p-2 flex-shrink-0 border-b border-gray-700/50">
    <select
      value={sortOrder}
      onChange={(e) => onSortChange(e.target.value as SortOrder)}
      className="w-full bg-gray-800 border border-gray-700 rounded-md py-1.5 px-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="updatedAt_desc">Sort: Modified (Newest)</option>
      <option value="updatedAt_asc">Sort: Modified (Oldest)</option>
      <option value="createdAt_desc">Sort: Created (Newest)</option>
      <option value="createdAt_asc">Sort: Created (Oldest)</option>
      <option value="title_asc">Sort: Title (A-Z)</option>
      <option value="title_desc">Sort: Title (Z-A)</option>
    </select>
  </div>
);
