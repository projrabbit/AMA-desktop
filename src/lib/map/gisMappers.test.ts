import { describe, expect, it } from 'vitest';

import type { BuildingItem, GeofenceItem, RealtimeLocationItem } from '@/types/api';
import { mapBuildingToScene, mapGeofenceToScene, mapLocationToScenePoint } from './gisMappers';

describe('GIS scene mappers', () => {
  it('maps realtime locations from OpenAPI shape to employee scene points', () => {
    const location: RealtimeLocationItem = {
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
      floor_id: 2,
      floor_name: 'Tầng 2',
      arcgis_layer_id: 'ama-layer',
      last_checkin_at: '2026-06-03T10:00:00Z',
      checked_in_at: '2026-06-03T10:00:00Z',
    };

    expect(mapLocationToScenePoint(location)).toEqual({
      id: 'employee-7-record-99',
      longitude: 106.701,
      latitude: 10.777,
      altitude: 24,
      title: 'Anna Nguyen',
      description: 'Ops • AMA Tower • Tầng 2',
    });
  });

  it('maps buildings and floors to scene markers', () => {
    const building: BuildingItem = {
      building_id: 1,
      name: 'AMA Tower',
      address: 'Q1',
      center_lat: 10.776889,
      center_lng: 106.700981,
      total_floors: 2,
      arcgis_layer_id: 'ama-building-layer',
      floors: [
        { floor_id: 10, building_id: 1, floor_number: 1, floor_name: 'Tầng 1', altitude_min: 15, altitude_max: 22 },
      ],
    };

    expect(mapBuildingToScene(building)).toEqual({
      id: 'building-1',
      name: 'AMA Tower',
      longitude: 106.700981,
      latitude: 10.776889,
      address: 'Q1',
      arcgisLayerId: 'ama-building-layer',
      floors: [{ id: 'floor-10', name: 'Tầng 1', altitudeMin: 15, altitudeMax: 22 }],
    });
  });

  it('maps geofence radius and altitude metadata to scene circles', () => {
    const geofence: GeofenceItem = {
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
    };

    expect(mapGeofenceToScene(geofence)).toEqual({
      id: 'geofence-5',
      name: 'Sảnh chính',
      longitude: 106.7009,
      latitude: 10.7768,
      radiusMeters: 30,
      altitudeMin: 15,
      altitudeMax: 22,
      buildingName: 'AMA Tower',
      floorName: 'Tầng 1',
      isActive: true,
    });
  });
});
