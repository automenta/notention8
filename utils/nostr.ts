import { SimplePool } from 'nostr-tools';
import type { NostrEvent, Note, Property } from '../types';

export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.snort.social',
  'wss://nostr.wine',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
];

/**
 * A shared Nostr SimplePool instance to be used across the entire application.
 * This prevents creating multiple WebSocket connections to the same relays and ensures
 * connection state is managed centrally.
 */
export const pool = new SimplePool();

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    // To prevent errors on odd-length strings (e.g., from user input)
    hex = '0' + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

export const formatNpub = (npub: string) =>
  `${npub.slice(0, 10)}...${npub.slice(-4)}`;

/**
 * Extracts plain text from an HTML string.
 * @param content - An HTML string.
 * @returns A single string containing all the text from the document.
 */
export function getTextFromHtml(content: string): string {
  if (!content) return '';

  const div = document.createElement('div');
  div.innerHTML = content;

  // Add newlines after block elements for better preview readability
  div
    .querySelectorAll('p, h1, h2, h3, li, blockquote, pre, div')
    .forEach((el) => {
      el.appendChild(document.createTextNode('\n'));
    });

  return div.textContent || '';
}

export const extractPropertiesFromTags = (tags: string[][]): Property[] => {
  const propsMap = new Map<string, Property>();

  tags.forEach((t) => {
    if (t[0] === 'property') {
      const key = t[1];
      const op = t[2];
      const val = t[3];

      if (propsMap.has(key)) {
        propsMap.get(key)!.values.push(val);
      } else {
        propsMap.set(key, {
          key,
          operator: op,
          values: [val],
        });
      }
    }
  });

  return Array.from(propsMap.values());
};

export const convertEventToNote = (event: NostrEvent): Note => {
  return {
    id: event.id,
    title: '',
    content: event.content,
    tags: event.tags.filter((t) => t[0] === 't').map((t) => t[1]),
    published: true,
    properties: extractPropertiesFromTags(event.tags),
    createdAt: new Date(event.created_at * 1000).toISOString(),
    updatedAt: new Date(event.created_at * 1000).toISOString(),
  };
};
