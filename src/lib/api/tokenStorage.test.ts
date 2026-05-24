import { describe, expect, it } from 'vitest';

import { createMemoryTokenStorage } from './tokenStorage';

describe('token storage', () => {
  it('stores, reads, updates, and clears tokens', () => {
    const storage = createMemoryTokenStorage();

    storage.setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    expect(storage.getTokens()).toEqual({ accessToken: 'access', refreshToken: 'refresh' });

    storage.updateAccessToken('new-access');
    expect(storage.getTokens()).toEqual({ accessToken: 'new-access', refreshToken: 'refresh' });

    storage.clearTokens();
    expect(storage.getTokens()).toBeNull();
  });
});
