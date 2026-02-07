import React, { useMemo } from 'react';
import { SparklesIcon } from '../layout/icons';
import { DAILY_PROMPTS } from '../../utils/constants';

interface DailyPromptWidgetProps {
  onCreateNote: () => void;
}

export const DailyPromptWidget: React.FC<DailyPromptWidgetProps> = ({ onCreateNote }) => {
  const todaysPrompt = useMemo(() => {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/30 rounded-2xl p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <SparklesIcon className="w-24 h-24" />
         </div>
         <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
             <SparklesIcon className="w-5 h-5" />
             Daily Prompt
         </h3>
         <p className="text-xl md:text-2xl font-bold text-white mb-6 relative z-10">
             &quot;{todaysPrompt}&quot;
         </p>
         <button
            onClick={onCreateNote}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 relative z-10"
         >
             Write about this
         </button>
    </div>
  );
};
