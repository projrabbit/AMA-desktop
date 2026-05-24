export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStorage {
  getTokens(): AuthTokens | null;
  setTokens(tokens: AuthTokens): void;
  updateAccessToken(accessToken: string): void;
  clearTokens(): void;
}

const STORAGE_KEY = 'ama.dashboard.tokens';
const listeners = new Set<(tokens: AuthTokens | null) => void>();

function emitTokenChange(tokens: AuthTokens | null) {
  for (const listener of listeners) {
    listener(tokens);
  }
}

export function subscribeTokenStorage(listener: (tokens: AuthTokens | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function createMemoryTokenStorage(initialTokens: AuthTokens | null = null): TokenStorage {
  let current = initialTokens;

  return {
    getTokens: () => current,
    setTokens: (tokens) => {
      current = tokens;
      emitTokenChange(current);
    },
    updateAccessToken: (accessToken) => {
      if (current) {
        current = { ...current, accessToken };
        emitTokenChange(current);
      }
    },
    clearTokens: () => {
      current = null;
      emitTokenChange(null);
    },
  };
}

export function createLocalTokenStorage(storage: Storage = window.localStorage): TokenStorage {
  return {
    getTokens: () => {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as AuthTokens;
      } catch {
        storage.removeItem(STORAGE_KEY);
        emitTokenChange(null);
        return null;
      }
    },
    setTokens: (tokens) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(tokens));
      emitTokenChange(tokens);
    },
    updateAccessToken: (accessToken) => {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      try {
        const tokens = JSON.parse(raw) as AuthTokens;
        const nextTokens = { ...tokens, accessToken };
        storage.setItem(STORAGE_KEY, JSON.stringify(nextTokens));
        emitTokenChange(nextTokens);
      } catch {
        storage.removeItem(STORAGE_KEY);
        emitTokenChange(null);
      }
    },
    clearTokens: () => {
      storage.removeItem(STORAGE_KEY);
      emitTokenChange(null);
    },
  };
}

export const browserTokenStorage: TokenStorage =
  typeof window === 'undefined' ? createMemoryTokenStorage() : createLocalTokenStorage();
