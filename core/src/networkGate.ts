import type { Note } from './types';

export class NetworkGate {
  /**
   * Check if note can be transmitted over network
   * @throws {PrivacyError} if note is private and not confirmed
   */
  async canTransmit(
    note: Note,
    destination: string,
    promptUser?: (message: string) => Promise<boolean>
  ): Promise<boolean> {
    if (note.public) return true;

    if (!promptUser) {
      throw new PrivacyError(
        `Cannot transmit private note ${note.id} to ${destination}`
      );
    }

    const confirmed = await promptUser(
      `"${note.title}" is private. Make public to share with ${destination}?`
    );

    if (!confirmed) return false;

    // User confirmed - mark as public
    note.public = true;
    return true;
  }
}

export class PrivacyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrivacyError';
  }
}
