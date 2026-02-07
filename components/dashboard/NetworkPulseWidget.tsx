import React from 'react';
import { NetworkIcon, CubeIcon } from '../layout/icons';
import { getLogStyle } from '../../utils/ui';
import type { Log } from '../../hooks/simulator/useSimulationNetwork';

interface NetworkPulseWidgetProps {
  logs: Log[];
  simulatorActive: boolean;
  onStartSimulator: () => void;
}

export function NetworkPulseWidget({ logs, simulatorActive, onStartSimulator }: NetworkPulseWidgetProps) {
    // Recent logs logic duplicated from DashboardView, but contained here
    const recentLogs = [...logs].reverse().slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-6 flex flex-col h-96">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <NetworkIcon className="h-5 w-5" />
                Network Pulse
            </div>
            {simulatorActive && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
        </h3>

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
    </div>
  );
}
