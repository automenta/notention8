import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAgent } from '../../components/contexts/AgentContext';
import { CpuChipIcon } from '../common/icons';

interface AgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentStatusModal({ isOpen, onClose }: AgentStatusModalProps) {
  const { isConnected, sendMessage, lastMessage } = useAgent();
  const [statusResponse, setStatusResponse] = useState<any>(null);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'clawdbot_status_update') {
        setStatusResponse(lastMessage.payload);
    }
  }, [lastMessage]);

  const handleCheckStatus = () => {
      setStatusResponse(null); // Clear previous
      sendMessage({ type: 'clawdbot_status' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agent Status">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className={`p-2 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <CpuChipIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-medium text-gray-200">Gateway Connection</h3>
                <p className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Connected via WebSocket' : 'Disconnected'}
                </p>
            </div>
        </div>

        <div className="border-t border-gray-700/50 pt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-300">ClawdBot System Status</h4>
                <Button onClick={handleCheckStatus} disabled={!isConnected} size="sm" variant="secondary">
                    Refresh Status
                </Button>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-auto max-h-40 border border-gray-700/50">
                {statusResponse ? (
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className="text-green-400">{statusResponse.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Agents:</span>
                            <span className="text-blue-400">{statusResponse.agents}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Last Activity:</span>
                            <span className="text-gray-400">{new Date(statusResponse.lastActivity).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Connected:</span>
                            <span className={statusResponse.connected ? 'text-green-400' : 'text-red-400'}>
                                {String(statusResponse.connected)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-600 italic">
                        {isConnected ? 'Click Refresh to query agent...' : 'Connect to query agent.'}
                    </span>
                )}
            </div>
        </div>
      </div>
    </Modal>
  );
}
