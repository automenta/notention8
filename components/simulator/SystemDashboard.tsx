import React from 'react';
import { getLogStyle } from '../../utils/ui';

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
         <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 font-bold text-xs text-gray-300 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-gray-500"></span>
             SYSTEM EVENTS
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-[10px] custom-scrollbar">
             {logs.length === 0 && (
                 <div className="text-center text-gray-600 italic py-4">No events yet.</div>
             )}
             {logs.map((log, i) => (
                 <div key={i} className={`p-2 border-l-2 rounded-r ${getLogStyle(log.type)}`}>
                     {log.msg}
                 </div>
             ))}
         </div>

         <div className="bg-gray-800 px-3 py-2 border-t border-gray-700 font-bold text-xs text-gray-300 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 ONTOLOGY GROWTH
             </div>
             <button
                onClick={optimizeOntology}
                className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded shadow-lg shadow-blue-900/20 transition-all flex items-center gap-1"
             >
                ✨ Optimize
             </button>
         </div>
         <div className="h-1/3 overflow-y-auto p-2 font-mono text-[10px] space-y-1 bg-gray-950/30">
             {newAttributes.length === 0 && (
                 <div className="text-center text-gray-600 italic py-2">No new attributes detected.</div>
             )}
             {newAttributes.map((attr, i) => (
                 <div key={i} className="text-green-400 flex items-center gap-2 p-1 hover:bg-white/5 rounded">
                     <span>🌱</span>
                     <span className="font-bold">{attr.key}</span>
                     <span className='text-gray-500'>({attr.type})</span>
                 </div>
             ))}
         </div>
    </div>
  );
};
