import React from 'react';
import { NetworkIcon, CubeIcon } from '../layout/icons';
import { getLogStyle } from '../../utils/ui';
import { Card } from '../common/Card';

interface NetworkPulseWidgetProps {
  logs: Array<{ type: string; msg: string }>;
  simulatorActive: boolean;
  onStartSimulator: () => void;
}

export const NetworkPulseWidget: React.FC<NetworkPulseWidgetProps> = ({ logs, simulatorActive, onStartSimulator }) => {
  const recentLogs = [...logs].reverse().slice(0, 5);

  const title = (
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
            Network Pulse
        </div>
        {simulatorActive && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
    </div>
  );

  return (
     <Card className="flex flex-col h-96" title={title} icon={NetworkIcon}>
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                    <div key={i} className={`text-xs p-3 rounded-lg border-l-2 border-gray-800 ${getLogStyle(log.type)}`}>
                        <div className="flex items-center gap-2 mb-1">
                             <span className="text-gray-500 font-mono uppercase text-[10px] opacity-75">{log.type}</span>
                        </div>
                        <p className="leading-relaxed opacity-90">{log.msg}</p>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <CubeIcon className="w-12 h-12 text-gray-700 mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No recent activity.</p>
                    {!simulatorActive && (
                        <button
                            onClick={onStartSimulator}
                            className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded border border-blue-900 hover:bg-blue-900/50 transition-colors"
                        >
                            Start Simulator
                        </button>
                    )}
                </div>
            )}
        </div>
     </Card>
  );
};
