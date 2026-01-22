import React, { useState } from 'react';
import { SparklesIcon, PencilIcon, ArrowPathIcon } from '../layout/icons';
import { DAILY_PROMPTS } from '../../utils/constants';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';

interface DailyPromptWidgetProps {
  onCreateNote: () => void;
}

export const DailyPromptWidget: React.FC<DailyPromptWidgetProps> = ({ onCreateNote }) => {
  const [promptIndex, setPromptIndex] = useState(() => {
       const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
       return dayOfYear % DAILY_PROMPTS.length;
  });

  const prompt = DAILY_PROMPTS[promptIndex];

  const handleRefresh = () => {
      setPromptIndex(prev => (prev + 1) % DAILY_PROMPTS.length);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/30 rounded-2xl p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <SparklesIcon className="w-24 h-24" />
         </div>
         <div className="flex justify-between items-start mb-2 relative z-10">
             <h3 className="text-blue-300 font-semibold flex items-center gap-2">
                 <SparklesIcon className="w-5 h-5" />
                 Daily Prompt
             </h3>
             <IconButton
                onClick={handleRefresh}
                icon={ArrowPathIcon}
                variant="ghost"
                size="sm"
                title="New Prompt"
                className="text-blue-300 hover:text-white hover:bg-blue-800/30"
             />
         </div>
         <p className="text-xl md:text-2xl font-bold text-white mb-6 relative z-10 min-h-[4rem] animate-fade-in">
             &quot;{prompt}&quot;
         </p>
         <Button
            onClick={onCreateNote}
            variant="primary"
            size="md"
            icon={PencilIcon}
            className="shadow-lg shadow-blue-900/20 relative z-10"
         >
             Write about this
         </Button>
    </div>
  );
};
