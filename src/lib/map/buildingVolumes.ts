import type { MapBuilding } from './types';

export const DEFAULT_FOOTPRINT_RADIUS_M = 20;
export const DEFAULT_FLOOR_HEIGHT_M = 3.5;
const MIN_FLOOR_HEIGHT_M = 0.5;

export interface FloorExtrusion {
  baseZ: number;
  height: number;
  label: string;
  colorIndex: number;
}

export function buildFloorExtrusions(building: MapBuilding): FloorExtrusion[] {
  const floors = building.floors ?? [];
  if (floors.length === 0) {
    return [{ baseZ: 0, height: DEFAULT_FLOOR_HEIGHT_M, label: building.name, colorIndex: 0 }];
  }
  return floors.map((floor, index) => ({
    baseZ: floor.altitudeMin,
    height: Math.max(floor.altitudeMax - floor.altitudeMin, MIN_FLOOR_HEIGHT_M),
    label: floor.name,
    colorIndex: index,
  }));
}
