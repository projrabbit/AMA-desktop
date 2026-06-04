import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MapPage } from './MapPage';

const mapMocks = vi.hoisted(() => ({
  arcgisSceneProps: [] as Record<string, unknown>[],
  buildingList: vi.fn(),
  geofenceList: vi.fn(),
  realtimeLocations: vi.fn(),
}));

vi.mock('@/components/map/ArcgisScene', () => ({
  ArcgisScene: (props: Record<string, unknown>) => {
    mapMocks.arcgisSceneProps.push(props);
    return <section aria-label={String(props.title)} role="region" />;
  },
}));

vi.mock('@/services/buildingService', () => ({
  buildingService: { list: mapMocks.buildingList },
}));

vi.mock('@/services/geofenceService', () => ({
  geofenceService: { list: mapMocks.geofenceList },
}));

vi.mock('@/services/realtimeService', () => ({
  realtimeService: { locations: mapMocks.realtimeLocations },
}));

describe('MapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mapMocks.arcgisSceneProps.length = 0;
    mapMocks.realtimeLocations.mockResolvedValue({
      success: true,
      data: [
        {
          employee_id: 7,
          full_name: 'Anna Nguyen',
          department_id: 3,
          department_name: 'Ops',
          record_id: 99,
          latitude: 10.777,
          longitude: 106.701,
          altitude: 24,
          gps_accuracy: 4,
          building_id: 1,
          building_name: 'AMA Tower',
          floor_id: 10,
          floor_name: 'Tầng 1',
          arcgis_layer_id: 'ama-building-layer',
          last_checkin_at: '2026-06-03T10:00:00Z',
          checked_in_at: '2026-06-03T10:00:00Z',
        },
      ],
    });
    mapMocks.buildingList.mockResolvedValue({
      success: true,
      data: [
        {
          building_id: 1,
          name: 'AMA Tower',
          address: 'Q1',
          center_lat: 10.776889,
          center_lng: 106.700981,
          total_floors: 1,
          arcgis_layer_id: 'ama-building-layer',
          floors: [
            { floor_id: 10, building_id: 1, floor_number: 1, floor_name: 'Tầng 1', altitude_min: 15, altitude_max: 22 },
          ],
        },
      ],
    });
    mapMocks.geofenceList.mockResolvedValue({
      success: true,
      data: [
        {
          geofence_id: 5,
          floor_id: 10,
          name: 'Sảnh chính',
          building_id: 1,
          building_name: 'AMA Tower',
          floor_name: 'Tầng 1',
          center_lat: 10.7768,
          center_lng: 106.7009,
          radius_meters: 30,
          altitude_min: 15,
          altitude_max: 22,
          allow_checkin: true,
          allow_checkout: true,
          is_active: true,
        },
      ],
    });
  });

  it('passes default toggle state and updates it when the 3D buildings toggle is clicked', async () => {
    render(<MapPage />);

    await waitFor(() => expect(mapMocks.arcgisSceneProps.length).toBeGreaterThan(0));
    expect(mapMocks.arcgisSceneProps.at(-1)).toMatchObject({ showGeofences: true, showBuildings3d: false });

    fireEvent.click(screen.getByLabelText('Khối 3D tòa nhà'));

    await waitFor(() =>
      expect(mapMocks.arcgisSceneProps.at(-1)).toMatchObject({ showGeofences: true, showBuildings3d: true }),
    );
  });

  it('renders realtime employees with building and geofence GIS context from APIs', async () => {
    render(<MapPage />);

    await waitFor(() => expect(mapMocks.arcgisSceneProps.length).toBeGreaterThan(0));
    const props = mapMocks.arcgisSceneProps.at(-1);

    expect(mapMocks.buildingList).toHaveBeenCalledWith({ include_floors: true });
    expect(mapMocks.geofenceList).toHaveBeenCalledWith({ is_active: true });
    expect(props).toMatchObject({
      points: [expect.objectContaining({ id: 'employee-7-record-99' })],
      buildings: [expect.objectContaining({ id: 'building-1' })],
      geofences: [expect.objectContaining({ id: 'geofence-5' })],
    });
  });
});
