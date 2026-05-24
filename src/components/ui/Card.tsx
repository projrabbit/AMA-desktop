import type { ReactNode } from 'react';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="ui-card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
