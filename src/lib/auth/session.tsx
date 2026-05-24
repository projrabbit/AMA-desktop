/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { browserTokenStorage, subscribeTokenStorage, type TokenStorage } from '@/lib/api/tokenStorage';
import { isDashboardRole } from '@/lib/auth/permissions';
import { authService } from '@/services/authService';
import type { ApiSuccess } from '@/types/api';
import type { AccountRole, MeData } from '@/types/api';

interface SessionContextValue {
  role: AccountRole | null;
  user: MeData | null;
  setSession(user: MeData | null): void;
  clearSession(): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  initialRole?: AccountRole | null;
  loadCurrentUser?: () => Promise<ApiSuccess<MeData>>;
  tokenStorage?: TokenStorage;
}

export function SessionProvider({
  children,
  initialRole = null,
  loadCurrentUser = authService.me,
  tokenStorage = browserTokenStorage,
}: SessionProviderProps) {
  const [user, setUser] = useState<MeData | null>(null);
  const [role, setRole] = useState<AccountRole | null>(initialRole);

  useEffect(() => {
    return subscribeTokenStorage((tokens) => {
      if (!tokens) {
        setUser(null);
        setRole(null);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      if (!tokenStorage.getTokens()) {
        return;
      }

      try {
        const response = await loadCurrentUser();
        if (cancelled) {
          return;
        }

        if (!isDashboardRole(response.data.account.role)) {
          tokenStorage.clearTokens();
          return;
        }

        setUser(response.data);
        setRole(response.data.account.role);
      } catch {
        if (!cancelled) {
          tokenStorage.clearTokens();
        }
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [loadCurrentUser, tokenStorage]);

  const value = useMemo<SessionContextValue>(
    () => ({
      role,
      user,
      setSession: (nextUser) => {
        setUser(nextUser);
        setRole(nextUser?.account.role ?? null);
      },
      clearSession: () => {
        setUser(null);
        setRole(null);
      },
    }),
    [role, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
