import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/apiErrors';
import { browserTokenStorage } from '@/lib/api/tokenStorage';
import { isDashboardRole } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { getVietnameseErrorMessage } from '@/lib/i18n/errorMessages';
import { authService, type LoginRequest } from '@/services/authService';
import type { ApiSuccess, LoginData } from '@/types/api';

interface LoginPageProps {
  login?: (body: LoginRequest) => Promise<ApiSuccess<LoginData>>;
}

export function LoginPage({ login = authService.login }: LoginPageProps) {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await login({ username, password });
      const { account, employee, access_token, refresh_token } = response.data;

      if (!isDashboardRole(account.role)) {
        browserTokenStorage.clearTokens();
        setError(getVietnameseErrorMessage('NO_DASHBOARD_PERMISSION'));
        return;
      }

      browserTokenStorage.setTokens({ accessToken: access_token, refreshToken: refresh_token });
      setSession({ account, employee });
      navigate('/overview', { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.userMessage);
      } else {
        setError(getVietnameseErrorMessage('NETWORK_ERROR'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-eyebrow">AMA Smart Attendance</p>
        <h1>Đăng nhập Dashboard</h1>
        <p>Theo dõi chấm công, bản đồ 3D và ngoại lệ trong một không gian quản trị.</p>
        <Input
          label="Email công ty"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p role="alert">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </main>
  );
}
