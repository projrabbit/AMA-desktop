import { RouterProvider } from 'react-router-dom';

import { SessionProvider } from '@/lib/auth/session';
import { router } from '@/routes/routeConfig';

export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
