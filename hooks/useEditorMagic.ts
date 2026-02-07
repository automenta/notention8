import { useCallback } from 'react';
import type { OntologyNode } from '../types';
import { useGardener } from './useGardener';
import { useAutoTagging } from './useAutoTagging';
import { useToast } from '../components/contexts/ToastContext';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties, replacePropertyInString } from '../utils/parsing';
import { parseNaturalDate } from '../utils/dateParsing';

interface UseEditorMagicProps {
    content: string;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    onContentSave: (content: string) => void;
    ontology: OntologyNode[];
}

export function useEditorMagic({ content, tags, onTagsChange, onContentSave, ontology }: UseEditorMagicProps) {
    const { alignToOntology, generateCompletion } = useGardener();
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

    const handlePrompt = useCallback(async (prompt: string, selection?: string) => {
        const cleanText = selection || getTextFromHtml(content);
        const fullPrompt = `${prompt}\n\nInput Text:\n${cleanText}`;

        try {
            const result = await generateCompletion(fullPrompt);
            if (!result) throw new Error("No response from AI provider");

            const formatted = result.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');

            // Heuristic for "replace" vs "append"
            const lower = prompt.toLowerCase();
            const isReplace = lower.includes('fix') || lower.includes('rewrite') || lower.includes('translate');

            if (selection) {
                // If text was selected, we likely want to replace the selection or append after it.
                // However, Tiptap API is needed to replace selection cleanly.
                // Since we only have access to `content` string here, implementing robust "replace selection"
                // requires passing a callback or referencing editor instance higher up.
                // For simplicity in this architecture, we will append the result to the note if a selection was used,
                // treating it as an "analysis of selection".
                onContentSave(content + '\n<hr>\n<h3>AI Analysis of Selection:</h3>' + formatted);
                addToast('AI analysis of selection appended.', 'success');
            } else {
                if (isReplace) {
                     onContentSave(formatted);
                     addToast('Content updated by AI.', 'success');
                } else {
                     onContentSave(content + '\n<hr>\n' + formatted);
                     addToast('AI response appended.', 'success');
                }
            }
        } catch (e) {
            console.error(e);
            addToast('AI Request Failed: ' + (e instanceof Error ? e.message : String(e)), 'error');
        }
    }, [content, generateCompletion, onContentSave, addToast]);

    return {
        handleMagic,
        handlePrompt,
        handleAutoTag,
        isAutoTagging,
        isApiKeyAvailable
    };
}
