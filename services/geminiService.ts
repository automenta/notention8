import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.API_KEY;
export const isApiKeyAvailable = !!(API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY');

if (!isApiKeyAvailable) {
  console.warn(
    'Gemini API key is not set in process.env.API_KEY. AI features will be disabled.'
  );
}

const ai = isApiKeyAvailable ? new GoogleGenAI({ apiKey: API_KEY || '' }) : null;

const MODEL_NAME = 'gemini-2.5-flash';

const createSummaryPrompt = (text: string) => `Summarize the following note content into a single, concise paragraph. Focus on the main narrative and key points. Ignore structured data like hashtags or key-value properties. Do not include any introductory phrases in your response.

Note Content:
${text}
`;

export const summarizeText = async (textToSummarize: string): Promise<string> => {
  if (!ai) {
    throw new Error('Gemini API key not configured. Cannot summarize text.');
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: createSummaryPrompt(textToSummarize),
      config: {
        temperature: 0.2,
        topP: 0.9,
        topK: 20,
      },
    });

    const summary = response.text?.trim();
    if (!summary) {
      throw new Error('Received an empty summary from the API.');
    }

    return summary;
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the summary.');
  }
};
