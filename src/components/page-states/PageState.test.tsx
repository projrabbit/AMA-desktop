import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ForbiddenState, LoadingState, NotFoundState } from './PageState';

describe('page states', () => {
  it('renders Vietnamese loading, forbidden, and not found messages', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();

    rerender(<ForbiddenState />);
    expect(screen.getByText('Bạn không có quyền truy cập nội dung này.')).toBeInTheDocument();

    rerender(<NotFoundState />);
    expect(screen.getByText('Không tìm thấy trang.')).toBeInTheDocument();
  });
});
