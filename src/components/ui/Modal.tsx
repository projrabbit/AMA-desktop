import type { ReactNode } from 'react';

import { Button } from './Button';

interface ModalProps {
  title: string;
  open: boolean;
  onClose(): void;
  children: ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-backdrop" role="presentation">
      <section className="ui-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </header>
        {children}
      </section>
    </div>
  );
}
