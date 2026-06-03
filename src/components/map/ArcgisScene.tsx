import { useEffect, useRef, useState } from 'react';

import { buildArcgisRuntimeConfig } from '@/lib/map/arcgisConfig';
import { createSceneView } from '@/lib/map/createSceneView';
import type { ArcgisSceneHandle, MapBuilding, MapGeofence, MapPoint } from '@/lib/map/types';

interface ArcgisSceneProps {
  title: string;
  points?: MapPoint[];
  buildings?: MapBuilding[];
  geofences?: MapGeofence[];
  showGeofences?: boolean;
  showBuildings3d?: boolean;
  className?: string;
}

const EMPTY_POINTS: MapPoint[] = [];
const EMPTY_BUILDINGS: MapBuilding[] = [];
const EMPTY_GEOFENCES: MapGeofence[] = [];

export function ArcgisScene({
  title,
  points = EMPTY_POINTS,
  buildings = EMPTY_BUILDINGS,
  geofences = EMPTY_GEOFENCES,
  showGeofences = true,
  showBuildings3d = false,
  className,
}: ArcgisSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ArcgisSceneHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Latest toggle values, read at mount time without forcing a rebuild.
  const visibilityRef = useRef({ geofences: showGeofences, buildings3d: showBuildings3d });
  visibilityRef.current = { geofences: showGeofences, buildings3d: showBuildings3d };

  useEffect(() => {
    let cancelled = false;

    async function mountScene() {
      if (!containerRef.current) {
        return;
      }

      try {
        handleRef.current = await createSceneView({
          container: containerRef.current,
          config: buildArcgisRuntimeConfig(),
          points,
          buildings,
          geofences,
          visibility: visibilityRef.current,
        });
        if (cancelled) {
          handleRef.current.destroy();
          handleRef.current = null;
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải bản đồ ArcGIS. Vui lòng kiểm tra cấu hình bản đồ.');
        }
      }
    }

    void mountScene();

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [points, buildings, geofences]);

  useEffect(() => {
    handleRef.current?.setLayerVisibility({ geofences: showGeofences, buildings3d: showBuildings3d });
  }, [showGeofences, showBuildings3d]);

  return (
    <section className={className} aria-label={title} role="region">
      {error ? <p role="alert">{error}</p> : null}
      <div ref={containerRef} className="arcgis-scene" />
    </section>
  );
}
