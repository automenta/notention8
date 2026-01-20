import React, { useState } from 'react';
import type { OntologyNode } from '../../types';
import { ChevronDownIcon } from '../layout/icons';
import { AttributeList } from './AttributeList';

interface OntologyNodeProps {
  node: OntologyNode;
  level: number;
  usageStats?: Map<string, number>;
}

export const OntologyNodeItem: React.FC<OntologyNodeProps> = ({ node, level, usageStats }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first few levels
  const hasChildren = node.children && node.children.length > 0;

  // Calculate total usage for this node (tag usage)
  const tagCount = usageStats?.get(node.id) || usageStats?.get(node.label.toLowerCase()) || 0;

  return (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div
        className="flex items-center py-2 cursor-pointer group"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          <ChevronDownIcon
            className={`h-5 w-5 mr-2 text-gray-500 transition-transform transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
        ) : (
          <div className="w-5 h-5 mr-2" /> // Placeholder for alignment
        )}
        <span className="font-semibold text-blue-400">#{node.label}</span>

        {tagCount > 0 && (
            <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full" title="Usage count">
                {tagCount}
            </span>
        )}

        {node.description && (
          <span className="ml-4 text-sm text-gray-400 hidden md:inline group-hover:inline">
            - {node.description}
          </span>
        )}
      </div>

      {isOpen && node.attributes && Object.keys(node.attributes).length > 0 && (
          <AttributeList attributes={node.attributes} usageStats={usageStats} />
      )}

      {isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <OntologyNodeItem key={child.id} node={child} level={level + 1} usageStats={usageStats} />
          ))}
        </div>
      )}
    </div>
  );
};
