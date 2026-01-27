import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { SparklesIcon } from '../common/icons';
import { HybridInput } from '../editor/HybridInput';

export function SmartInputWidget() {
    return (
        <Card
            title="What's on your mind?"
            icon={SparklesIcon}
            className="shadow-xl relative overflow-hidden group"
            variant="default"
        >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <SparklesIcon className="w-24 h-24 text-purple-500 transform rotate-12" />
            </div>

            <div className="relative z-10">
                <HybridInput />
            </div>
        </Card>
    );
};
