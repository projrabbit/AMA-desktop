import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders Vietnamese accessible label and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Lưu thay đổi</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
