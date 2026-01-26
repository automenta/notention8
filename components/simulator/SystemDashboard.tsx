import React from 'react';
import { getLogStyle } from '../../utils/ui';
import { SparklesIcon } from '../layout/icons';

interface Log {
    type: string;
    msg: string;
}

interface SystemDashboardProps {
    logs: Log[];
    optimizeOntology: () => void;
    newAttributes: { key: string; type: string }[];
}

export const SystemDashboard: React.FC<SystemDashboardProps> = ({
    logs,
    optimizeOntology,
    newAttributes
}) => {
  return (
    <div className="col-span-1 h-full overflow-hidden flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-sm">
         {/* Header */}
         <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500 shadow-blue-500/50 shadow-sm"></span>
             <span className="font-bold text-xs text-gray-300 tracking-wide">SYSTEM EVENTS</span>
         </div>

         {/* Logs */}
         <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] custom-scrollbar bg-gray-950/50">
             {logs.length === 0 && (
                 <div className="flex items-center justify-center h-full text-gray-600 italic">No events yet.</div>
             )}
             {logs.map((log, i) => (
                 <div key={i} className={`p-1.5 border-l-2 rounded-r transition-all animate-fade-in ${getLogStyle(log.type)}`}>
                     {log.msg}
                 </div>
             ))}
         </div>

         {/* Ontology Section */}
         <div className="bg-gray-800 px-3 py-2 border-t border-gray-700 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-green-500/50 shadow-sm"></span>
                 <span className="font-bold text-xs text-gray-300 tracking-wide">ONTOLOGY GROWTH</span>
             </div>
             <button
                onClick={optimizeOntology}
                className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded shadow-lg shadow-blue-900/20 transition-all flex items-center gap-1.5"
                title="Optimize Ontology"
             >
                <SparklesIcon className="w-3 h-3" />
                Optimize
             </button>
         </div>

         {/* Ontology Growth List */}
         <div className="h-1/3 overflow-y-auto p-2 font-mono text-[10px] space-y-1 bg-gray-900">
             {newAttributes.length === 0 && (
                 <div className="flex items-center justify-center h-full text-gray-600 italic">No new attributes detected.</div>
             )}
             {newAttributes.map((attr, i) => (
                 <div key={i} className="text-green-400 flex items-center gap-2 p-1.5 hover:bg-white/5 rounded transition-colors border border-transparent hover:border-green-500/20">
                     <span>🌱</span>
                     <span className="font-bold">{attr.key}</span>
                     <span className='text-gray-500'>({attr.type})</span>
                 </div>
             ))}
         </div>
    </div>
  );
};
