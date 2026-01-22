import React, { useState } from 'react';
import { SparklesIcon, PencilIcon, ArrowPathIcon } from '../layout/icons';
import { DAILY_PROMPTS } from '../../utils/constants';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Card } from '../common/Card';

interface DailyPromptWidgetProps {
  onUsePrompt: (prompt: string) => void;
}

export const DailyPromptWidget: React.FC<DailyPromptWidgetProps> = ({ onUsePrompt }) => {
  const [promptIndex, setPromptIndex] = useState(() => {
       const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
       return dayOfYear % DAILY_PROMPTS.length;
  });

  const prompt = DAILY_PROMPTS[promptIndex];

  const handleRefresh = () => {
      setPromptIndex(prev => (prev + 1) % DAILY_PROMPTS.length);
  };

  const headerAction = (
     <IconButton
        onClick={handleRefresh}
        icon={ArrowPathIcon}
        variant="ghost"
        size="sm"
        tooltip="New Prompt"
        className="text-blue-300 hover:text-white hover:bg-blue-800/30"
     />
  );

  const title = (
     <span className="text-blue-300 font-semibold flex items-center gap-2">
         <SparklesIcon className="w-5 h-5" />
         Daily Prompt
     </span>
  );

  return (
    <Card
        variant="gradient"
        className="relative group border-blue-800/30"
        title={title}
        headerAction={headerAction}
    >
         {/* Background sparkles container with overflow hidden */}
         <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon className="w-24 h-24" />
            </div>
         </div>

         <div className="relative z-10">
            <p className="text-xl md:text-2xl font-bold text-white mb-6 min-h-[4rem] animate-fade-in">
                &quot;{prompt}&quot;
            </p>
            <Button
                onClick={() => onUsePrompt(prompt)}
                variant="primary"
                size="md"
                icon={PencilIcon}
                className="shadow-lg shadow-blue-900/20"
            >
                Write about this
            </Button>
         </div>
    </Card>
  );
};
