import type { BuildingItem, GeofenceItem, RealtimeLocationItem } from '@/types/api';
import type { MapBuilding, MapGeofence, MapPoint } from './types';

export function mapLocationToScenePoint(location: RealtimeLocationItem): MapPoint {
  return {
    id: `employee-${location.employee_id}-record-${location.record_id}`,
    longitude: location.longitude,
    latitude: location.latitude,
    altitude: location.altitude,
    title: location.full_name,
    description: [location.department_name, location.building_name, location.floor_name].filter(Boolean).join(' • '),
  };
}

export function mapBuildingToScene(building: BuildingItem): MapBuilding {
  return {
    id: `building-${building.building_id}`,
    name: building.name,
    longitude: building.center_lng,
    latitude: building.center_lat,
    address: building.address,
    arcgisLayerId: building.arcgis_layer_id,
    floors: (building.floors ?? []).map((floor) => ({
      id: `floor-${floor.floor_id}`,
      name: floor.floor_name,
      altitudeMin: floor.altitude_min,
      altitudeMax: floor.altitude_max,
    })),
  };
}

export function mapGeofenceToScene(geofence: GeofenceItem): MapGeofence {
  return {
    id: `geofence-${geofence.geofence_id}`,
    name: geofence.name,
    longitude: geofence.center_lng,
    latitude: geofence.center_lat,
    radiusMeters: geofence.radius_meters,
    altitudeMin: geofence.altitude_min,
    altitudeMax: geofence.altitude_max,
    buildingName: geofence.building_name,
    floorName: geofence.floor_name,
    isActive: geofence.is_active,
  };
}
