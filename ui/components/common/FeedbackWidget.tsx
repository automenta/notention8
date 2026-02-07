import React, { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useAgent } from '../contexts/AgentContext';

interface FeedbackWidgetProps {
    entityId: string;
    entityType: 'note' | 'skill' | 'match' | 'suggestion' | 'property';
}

export function FeedbackWidget({ entityId, entityType }: FeedbackWidgetProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [details, setDetails] = useState('');
  const { sendMessage } = useAgent();

  const submit = (value: number, context?: any) => {
    sendMessage('submit_feedback', {
      id: crypto.randomUUID(),
      entityId,
      entityType,
      value,
      context,
      timestamp: Date.now()
    });
  };

  return (
    <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
      <button
        onClick={() => submit(1)}
        title="Helpful"
        className="p-1 hover:text-green-400 text-gray-400"
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => submit(-1)}
        title="Not helpful"
        className="p-1 hover:text-red-400 text-gray-400"
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowDetailed(!showDetailed)}
        title="Provide details"
        className="p-1 hover:text-blue-400 text-gray-400"
      >
        <ChatBubbleLeftIcon className="w-4 h-4" />
      </button>

      {showDetailed && (
        <div className="absolute z-10 mt-2 p-2 bg-gray-800 rounded shadow-xl border border-gray-700 w-64">
            <textarea
                className="w-full bg-gray-900 rounded p-2 text-sm text-white mb-2"
                rows={3}
                placeholder="Why was this helpful/not helpful?"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setShowDetailed(false)}
                    className="text-xs text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        submit(0, { details });
                        setShowDetailed(false);
                        setDetails('');
                    }}
                    className="text-xs bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-500"
                >
                    Send
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
