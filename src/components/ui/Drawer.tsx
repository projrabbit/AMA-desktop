import type { ReactNode } from 'react';

export function Drawer({ title, open, children }: { title: string; open: boolean; children: ReactNode }) {
  return open ? (
    <aside className="ui-drawer" aria-label={title}>
      {children}
    </aside>
  ) : null;
}
