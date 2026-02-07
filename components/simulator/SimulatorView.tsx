import React, { useState } from 'react';
import type { Note, Property } from '../../types';
import { parseProperties } from '../../utils/parsing';
import { matchNotes } from '../../utils/matching';

export const SimulatorView: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const spawnAgent = (role: string) => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      role,
      notes: generateNotesForRole(role)
    };
    setAgents(prev => [...prev, newAgent]);
    addLog(`Spawned Agent ${newAgent.id.slice(0,4)} (${role})`);
  };

  const runCycle = () => {
    addLog('--- Running Cycle ---');
    // For each agent, try to match their requests against others' offers

    agents.forEach(agent => {
        agent.notes.forEach(note => {
            const isRequest = note.tags.includes('request');
            if (!isRequest) return;

            addLog(`Agent ${agent.id.slice(0,4)} looking for: ${note.title}`);

            agents.forEach(otherAgent => {
                if (agent.id === otherAgent.id) return;

                otherAgent.notes.forEach(offer => {
                    const isOffer = offer.tags.includes('offer');
                    if (!isOffer) return;

                    const score = matchNotes(note, offer);
                    if (score > 0) {
                        addLog(`  MATCH FOUND! Score: ${score.toFixed(2)} with Agent ${otherAgent.id.slice(0,4)}'s "${offer.title}"`);
                    }
                });
            });
        });
    });
  };

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  return (
    <div className="p-6 text-gray-200 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">🧪 Simulator Lab</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => spawnAgent('Freelancer')} className="bg-blue-600 px-4 py-2 rounded">Spawn Freelancer</button>
        <button onClick={() => spawnAgent('Client')} className="bg-green-600 px-4 py-2 rounded">Spawn Client</button>
        <button onClick={runCycle} className="bg-purple-600 px-4 py-2 rounded">Run Cycle</button>
        <button onClick={() => { setAgents([]); setLogs([]); }} className="bg-red-600 px-4 py-2 rounded">Reset</button>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-grow overflow-hidden">
        <div className="bg-gray-900 p-4 rounded overflow-y-auto">
            <h2 className="font-bold mb-2">Active Agents ({agents.length})</h2>
            {agents.map(a => (
                <div key={a.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <div className="font-bold text-sm text-blue-300">{a.role} <span className="text-gray-500">#{a.id.slice(0,4)}</span></div>
                    <ul className="text-xs text-gray-400 pl-2">
                        {a.notes.map(n => (
                            <li key={n.id}>- {n.title}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <div className="bg-black p-4 rounded font-mono text-sm overflow-y-auto border border-gray-700">
            {logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
            ))}
        </div>
      </div>
    </div>
  );
};

interface Agent {
    id: string;
    role: string;
    notes: Note[];
}

// Helpers to generate mock notes
const generateNotesForRole = (role: string): Note[] => {
    const notes: Note[] = [];
    if (role === 'Freelancer') {
        notes.push(mockNote('My Services', 'offer', '[service:is:Web Dev] [rate:is:50]'));
    } else if (role === 'Client') {
        notes.push(mockNote('Need Website', 'request', '[service:is:Web Dev] [rate < 100]'));
    }
    return notes;
};

const mockNote = (title: string, type: 'offer' | 'request', content: string): Note => {
    return {
        id: crypto.randomUUID(),
        title,
        content,
        tags: [type],
        properties: parseProperties(content),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};
