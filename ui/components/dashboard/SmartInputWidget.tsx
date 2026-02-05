import React from 'react';
import { Card } from '../common/Card';
import { SparklesIcon } from '../common/icons';
import { HybridInput } from '../editor/HybridInput';

export function SmartInputWidget() {
    return (
        <Card
            title="Hybrid Input"
            icon={SparklesIcon}
            className="shadow-xl relative group"
            variant="default"
        >
             <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <SparklesIcon className="w-24 h-24 text-purple-500 transform rotate-12" />
                </div>
             </div>

            <div className="relative z-10">
                <HybridInput />
            </div>
        </Card>
    );
};
