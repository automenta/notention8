import React from 'react';
import type { Property, OntologyNode } from '@notention/core';
import { IconButton } from '../common/IconButton';
import { Select } from '../common/Select';
import { PropertyValueInput } from './PropertyValueInput';
import { TrashIcon, InformationCircleIcon } from '../common/icons';

interface PropertyWidgetProps {
  property: Property;
  onChange: (updated: Property) => void;
  onRemove: () => void;
  ontology: OntologyNode[];
}

export function PropertyWidget({ property, onChange, onRemove, ontology }: PropertyWidgetProps) {
  const getAttributeDetails = (key: string, nodes: OntologyNode[]): { type: string, description?: string } | undefined => {
      if (!nodes) return undefined;
      for (const node of nodes) {
        if (node.attributes && node.attributes[key]) {
          return { type: node.attributes[key].type, description: node.attributes[key].description };
        }
        if (node.children) {
          const found = getAttributeDetails(key, node.children);
          if (found) return found;
        }
      }
      return undefined;
  };

  const currentAttr = getAttributeDetails(property.key, ontology);

  return (
    <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded border border-gray-700/50 hover:border-blue-500/30 transition-all mb-2 animate-fade-in">
       {/* Key Input */}
       <div className="relative w-1/3 min-w-[120px]">
           <input
             className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-blue-300 font-mono focus:outline-none focus:border-blue-500 transition-colors"
             list={`prop-keys-${property.key}`}
             value={property.key}
             onChange={(e) => onChange({...property, key: e.target.value})}
             placeholder="Key"
           />
           <datalist id={`prop-keys-${property.key}`}>
               {ontology.flatMap(n => n.attributes ? Object.keys(n.attributes) : []).map(k => (
                   <option key={k} value={k} />
               ))}
           </datalist>
           {currentAttr?.description && (
               <div className="absolute right-2 top-2.5 text-gray-500 cursor-help" title={currentAttr.description}>
                   <InformationCircleIcon className="w-3.5 h-3.5" />
               </div>
           )}
       </div>

       {/* Operator Select */}
       <div className="w-[110px] flex-shrink-0">
         <Select
             value={property.operator}
             onChange={(e) => onChange({...property, operator: e.target.value})}
             options={[
                 { value: 'is', label: 'is' },
                 { value: 'contains', label: 'contains' },
                 { value: 'greater than', label: '>' },
                 { value: 'less than', label: '<' },
                 { value: 'between', label: 'between' },
             ]}
             className=""
         />
       </div>

       {/* Value Input */}
       <div className="flex-1 min-w-[150px]">
           <PropertyValueInput
               value={property.values[0] || ''}
               onChange={(val) => onChange({...property, values: [val]})}
               attributeDef={currentAttr}
           />
       </div>

       <IconButton
           icon={TrashIcon}
           onClick={onRemove}
           size="sm"
           variant="ghost"
           className="text-gray-500 hover:text-red-400 hover:bg-red-900/20"
           tooltip="Remove property"
       />
    </div>
  );
}
