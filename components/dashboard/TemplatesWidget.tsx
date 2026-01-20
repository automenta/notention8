import React from 'react';
import { DocumentDuplicateIcon } from '../layout/icons';
import { DEFAULT_TEMPLATES } from '../../utils/templates';

interface TemplatesWidgetProps {
  onUseTemplate: (content: string) => void;
  onViewAll: () => void;
}

export function TemplatesWidget({ onUseTemplate, onViewAll }: TemplatesWidgetProps) {
  return (
     <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <DocumentDuplicateIcon className="h-5 w-5" />
            Start from Template
        </h3>
        <div className="space-y-3">
            {DEFAULT_TEMPLATES.slice(0, 3).map(tmpl => (
                <button
                    key={tmpl.id}
                    onClick={() => onUseTemplate(tmpl.content)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-750 border border-gray-800 rounded-xl transition-colors text-left group"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{tmpl.icon}</span>
                    <div>
                        <div className="font-medium text-gray-200 group-hover:text-white">{tmpl.label}</div>
                        <div className="text-xs text-gray-500">Create new</div>
                    </div>
                </button>
            ))}
             <button
                onClick={onViewAll}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-300 py-2"
            >
                View all templates in Sidebar
            </button>
        </div>
     </div>
  );
}
