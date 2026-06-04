export interface MapPoint {
  id: string;
  longitude: number;
  latitude: number;
  altitude?: number | null;
  title: string;
  description?: string;
}

export interface MapFloor {
  id: string;
  name: string;
  altitudeMin: number;
  altitudeMax: number;
}

export interface MapBuilding {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address?: string;
  arcgisLayerId?: string | null;
  floors?: MapFloor[];
}

export interface MapGeofence {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  radiusMeters: number;
  altitudeMin: number;
  altitudeMax: number;
  buildingName?: string | null;
  floorName?: string | null;
  isActive: boolean;
}

export interface SceneLayerVisibility {
  geofences?: boolean;
  buildings3d?: boolean;
}

export interface ArcgisSceneHandle {
  destroy(): void;
  setLayerVisibility(visibility: SceneLayerVisibility): void;
}
