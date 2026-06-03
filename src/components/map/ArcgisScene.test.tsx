import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSceneView } from '@/lib/map/createSceneView';
import { ArcgisScene } from './ArcgisScene';

const destroy = vi.fn();

vi.mock('@/lib/map/createSceneView', () => ({
  createSceneView: vi.fn(() => Promise.resolve({ destroy })),
}));

describe('ArcgisScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a labelled map region', () => {
    render(<ArcgisScene title="Bản đồ 3D" />);
    expect(screen.getByRole('region', { name: 'Bản đồ 3D' })).toBeInTheDocument();
  });

  it('passes API-derived GIS context into the ArcGIS renderer and destroys it on cleanup', async () => {
    const { unmount } = render(
      <ArcgisScene
        title="Bản đồ 3D"
        points={[{ id: 'employee-1', longitude: 106.7, latitude: 10.77, title: 'Anna' }]}
        buildings={[{ id: 'building-1', name: 'AMA Tower', longitude: 106.7, latitude: 10.77 }]}
        geofences={[
          {
            id: 'geofence-1',
            name: 'Sảnh chính',
            longitude: 106.7,
            latitude: 10.77,
            radiusMeters: 25,
            altitudeMin: 15,
            altitudeMax: 22,
            isActive: true,
          },
        ]}
      />,
    );

    await waitFor(() => expect(createSceneView).toHaveBeenCalled());
    expect(createSceneView).toHaveBeenCalledWith(
      expect.objectContaining({
        points: expect.arrayContaining([expect.objectContaining({ id: 'employee-1' })]),
        buildings: expect.arrayContaining([expect.objectContaining({ id: 'building-1' })]),
        geofences: expect.arrayContaining([expect.objectContaining({ id: 'geofence-1' })]),
      }),
    );

    unmount();
    expect(destroy).toHaveBeenCalled();
  });
});
