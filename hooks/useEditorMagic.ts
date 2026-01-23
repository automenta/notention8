import { useCallback } from 'react';
import type { OntologyNode } from '../types';
import { useGardener } from './useGardener';
import { useAutoTagging } from './useAutoTagging';
import { useToast } from './useToast';
import { parseProperties, replacePropertyInString, getTextFromHtml } from '../utils/parsing';
import { parseNaturalDate } from '../utils/dateParsing';

interface UseEditorMagicProps {
    content: string;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    onContentSave: (content: string) => void;
    ontology: OntologyNode[];
}

export function useEditorMagic({ content, tags, onTagsChange, onContentSave, ontology }: UseEditorMagicProps) {
    const { alignToOntology } = useGardener();
    const { addToast } = useToast();

    const { isAutoTagging, handleAutoTag, isApiKeyAvailable } = useAutoTagging({
        content,
        tags,
        onTagsChange
    });

    const handleMagic = useCallback(async () => {
        const cleanText = getTextFromHtml(content);
        const suggestions = await alignToOntology(cleanText, ontology);

        // Also look for natural language date conversions in existing properties
        const existingProps = parseProperties(content);
        let newContent = content;
        let convertedCount = 0;

        existingProps.forEach(prop => {
            if (['date', 'deadline', 'start', 'end'].some(k => prop.key.includes(k))) {
               const val = prop.values[0];
               if (!val) return;

               const parsed = parseNaturalDate(val);
               if (parsed && parsed !== val) {
                   const newProp = { ...prop, values: [parsed] };
                   newContent = replacePropertyInString(newContent, prop, newProp);
                   convertedCount++;
               }
            }
        });

        if (suggestions.length > 0 || convertedCount > 0) {
            if (suggestions.length > 0) {
                 newContent = newContent + '\n\n' + suggestions.map(t => `<p>${t}</p>`).join('');
            }
            onContentSave(newContent);

            // Also trigger auto-tagging
            handleAutoTag();

            addToast(`Magic: Added ${suggestions.length} properties, converted ${convertedCount} dates.`, 'success');
        } else {
            // Even if no properties, try auto-tagging
            handleAutoTag();
            addToast('Magic: Checked tags and properties.', 'info');
        }
    }, [content, alignToOntology, ontology, onContentSave, addToast, handleAutoTag]);

    return {
        handleMagic,
        handleAutoTag,
        isAutoTagging,
        isApiKeyAvailable
    };
}
