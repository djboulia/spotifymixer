import { ShuffleProgress } from "./shuffleprogress";

/**
 *
 * Keep track of the shuffles in progress across various user sessions.
 * Used for the UI callback to show a shuffle progress bar
 *
 */
export class ShuffleState {
  sessions: Record<string, ShuffleProgress | undefined> = {};

  /**
   * Track progress for a new session
   *
   * @param {Object} session
   * @returns
   */
  add(sessionKey: string) {
    const shuffleProgress = new ShuffleProgress();
    this.sessions[sessionKey] = shuffleProgress;
    return shuffleProgress;
  }

  /**
   * Get progress for an existing session
   *
   * @param {Object} session
   * @returns
   */
  get(sessionKey: string) {
    return this.sessions[sessionKey];
  }

  /**
   * Stop tracking progress for this session
   *
   * @param {Object} session
   * @returns
   */
  remove(sessionKey: string) {
    this.sessions[sessionKey] = undefined;
  }
}
