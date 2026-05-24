import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArcgisScene } from './ArcgisScene';

vi.mock('@/lib/map/createSceneView', () => ({
  createSceneView: vi.fn(() => Promise.resolve({ destroy: vi.fn() })),
}));

describe('ArcgisScene', () => {
  it('renders a labelled map region', () => {
    render(<ArcgisScene title="Bản đồ 3D" />);
    expect(screen.getByRole('region', { name: 'Bản đồ 3D' })).toBeInTheDocument();
  });
});
