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

    const handlePrompt = useCallback(async (prompt: string) => {
        const cleanText = getTextFromHtml(content);
        const fullPrompt = `${prompt}\n\nInput Text:\n${cleanText}`;

        try {
            const result = await generateCompletion(fullPrompt);
            if (!result) throw new Error("No response from AI provider");

            // We append the result for now, or replace?
            // Safer to append or let user decide, but for now let's just replace content if it seems like a rewrite,
            // or append if it seems like an analysis.
            // Simple heuristic: if prompt contains "fix" or "rewrite", replace. Else append.
            const lower = prompt.toLowerCase();
            if (lower.includes('fix') || lower.includes('rewrite') || lower.includes('translate')) {
                 // Try to preserve properties if possible by not stripping them?
                 // The prompt explicitly asks to preserve them in our presets.
                 // We will assume the LLM output is the new content.
                 // We need to be careful about HTML. LLM often outputs markdown.
                 // We might need a basic Markdown -> HTML converter or just wrap in <p>.
                 // For now, let's just wrap in paragraphs if it looks like plain text.
                 const formatted = result.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
                 onContentSave(formatted);
                 addToast('Content updated by AI.', 'success');
            } else {
                 const formatted = result.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
                 onContentSave(content + '\n<hr>\n' + formatted);
                 addToast('AI response appended.', 'success');
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
