import { describe, expect, it } from 'vitest';

import { buildFloorExtrusions, DEFAULT_FLOOR_HEIGHT_M } from './buildingVolumes';
import type { MapBuilding } from './types';

const baseBuilding: MapBuilding = {
  id: 'building-1',
  name: 'Demo House',
  longitude: 106.804,
  latitude: 10.869,
  floors: [
    { id: 'floor-1', name: 'F1', altitudeMin: 0, altitudeMax: 3.5 },
    { id: 'floor-2', name: 'F2', altitudeMin: 3.5, altitudeMax: 7 },
  ],
};

describe('buildFloorExtrusions', () => {
  it('returns one extrusion per floor using altitude range as base + height', () => {
    expect(buildFloorExtrusions(baseBuilding)).toEqual([
      { baseZ: 0, height: 3.5, label: 'F1', colorIndex: 0 },
      { baseZ: 3.5, height: 3.5, label: 'F2', colorIndex: 1 },
    ]);
  });

  it('falls back to a single default-height block when no floors are present', () => {
    expect(buildFloorExtrusions({ ...baseBuilding, floors: [] })).toEqual([
      { baseZ: 0, height: DEFAULT_FLOOR_HEIGHT_M, label: 'Demo House', colorIndex: 0 },
    ]);
  });

  it('clamps non-positive floor heights to a minimum so the volume stays visible', () => {
    const result = buildFloorExtrusions({
      ...baseBuilding,
      floors: [{ id: 'floor-1', name: 'F1', altitudeMin: 5, altitudeMax: 5 }],
    });
    expect(result[0].baseZ).toBe(5);
    expect(result[0].height).toBeGreaterThan(0);
  });
});
