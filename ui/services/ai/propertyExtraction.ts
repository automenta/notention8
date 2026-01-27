import type { Property } from '@notention/core';
import type { AIProvider } from './types';

export async function extractPropertiesFromText(
  text: string,
  aiService: AIProvider
): Promise<Property[]> {
  const prompt = `
Extract semantic properties from this text in the format [key:operator:value].

Text: "${text}"

Output as JSON array of {key, operator, values} objects.
Operators: "is", "contains", "less than", "greater than", "is near"

Example:
Input: "Looking for React dev, max $80/hr, remote only"
Output: [
  {"key": "skill", "operator": "contains", "values": ["React"]},
  {"key": "rate", "operator": "less than", "values": ["80"]},
  {"key": "remote", "operator": "is", "values": ["true"]}
]
`;

  try {
      const response = await aiService.complete(prompt);
      // Attempt to find JSON in response if it's wrapped in markdown
      const jsonMatch = response.match(/\[.*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonStr);
  } catch (e) {
      console.error("Failed to extract properties", e);
      return [];
  }
}
