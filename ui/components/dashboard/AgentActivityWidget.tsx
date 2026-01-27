import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../common/Card';
import { CpuChipIcon } from '../common/icons';
import { useAgent } from '../contexts/AgentContext';

export function AgentActivityWidget() {
    const { lastMessage, isConnected } = useAgent();
    const [logs, setLogs] = useState<{ message: string; timestamp: string }[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'clawdbot_log') {
            setLogs(prev => {
                const newLogs = [...prev, lastMessage.payload];
                // Keep last 100 logs
                if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
                return newLogs;
            });
        }
    }, [lastMessage]);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <Card
            title="Agent Activity"
            icon={CpuChipIcon}
            className="h-[300px] flex flex-col"
        >
            <div className="flex-1 bg-black/50 rounded p-2 overflow-y-auto font-mono text-xs space-y-1">
                {!isConnected && (
                    <div className="text-yellow-500">Connecting to Agent...</div>
                )}
                {logs.length === 0 && isConnected && (
                    <div className="text-gray-500 italic">No activity yet.</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="break-words">
                        <span className="text-gray-500 mr-2">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={log.message.startsWith('ERROR:') ? 'text-red-400' : 'text-green-400'}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </Card>
    );
}
