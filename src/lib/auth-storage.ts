/**
 * Thin wrapper around localStorage for the JWT.
 * Centralized so we can swap to httpOnly cookies later without touching callers.
 */

const TOKEN_KEY = "taskforge.token";

export const authStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore quota / privacy mode */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
  },
};
