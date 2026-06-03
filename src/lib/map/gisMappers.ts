import type { BuildingItem, GeofenceItem, RealtimeLocationItem } from '@/types/api';
import type { MapBuilding, MapGeofence, MapPoint } from './types';

function toNum(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNum(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapLocationToScenePoint(location: RealtimeLocationItem): MapPoint {
  return {
    id: `employee-${location.employee_id}-record-${location.record_id}`,
    longitude: toNum(location.longitude),
    latitude: toNum(location.latitude),
    altitude: toNullableNum(location.altitude),
    title: location.full_name,
    description: [location.department_name, location.building_name, location.floor_name].filter(Boolean).join(' • '),
  };
}

export function mapBuildingToScene(building: BuildingItem): MapBuilding {
  return {
    id: `building-${building.building_id}`,
    name: building.name,
    longitude: toNum(building.center_lng),
    latitude: toNum(building.center_lat),
    address: building.address,
    arcgisLayerId: building.arcgis_layer_id,
    floors: (building.floors ?? []).map((floor) => ({
      id: `floor-${floor.floor_id}`,
      name: floor.floor_name,
      altitudeMin: toNum(floor.altitude_min),
      altitudeMax: toNum(floor.altitude_max),
    })),
  };
}

export function mapGeofenceToScene(geofence: GeofenceItem): MapGeofence {
  return {
    id: `geofence-${geofence.geofence_id}`,
    name: geofence.name,
    longitude: toNum(geofence.center_lng),
    latitude: toNum(geofence.center_lat),
    radiusMeters: toNum(geofence.radius_meters),
    altitudeMin: toNum(geofence.altitude_min),
    altitudeMax: toNum(geofence.altitude_max),
    buildingName: geofence.building_name,
    floorName: geofence.floor_name,
    isActive: geofence.is_active,
  };
}
