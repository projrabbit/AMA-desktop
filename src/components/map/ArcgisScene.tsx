import { useEffect, useRef, useState } from 'react';

import { buildArcgisRuntimeConfig } from '@/lib/map/arcgisConfig';
import { createSceneView } from '@/lib/map/createSceneView';
import type { ArcgisSceneHandle, MapBuilding, MapGeofence, MapPoint } from '@/lib/map/types';

interface ArcgisSceneProps {
  title: string;
  points?: MapPoint[];
  buildings?: MapBuilding[];
  geofences?: MapGeofence[];
  className?: string;
}

export function ArcgisScene({ title, points = [], buildings = [], geofences = [], className }: ArcgisSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ArcgisSceneHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className={className} aria-label={title} role="region">
      {error ? <p role="alert">{error}</p> : null}
      <div ref={containerRef} className="arcgis-scene" />
    </section>
  );
}
