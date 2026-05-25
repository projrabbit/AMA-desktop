import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { buildArcgisRuntimeConfig } from '@/lib/map/arcgisConfig';
import { createSceneView } from '@/lib/map/createSceneView';
import type { ArcgisSceneHandle, MapPoint } from '@/lib/map/types';

interface ArcgisSceneProps {
  title: string;
  points?: MapPoint[];
  className?: string;
}

export function ArcgisScene({ title, points = [], className }: ArcgisSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ArcgisSceneHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const config = useMemo(() => buildArcgisRuntimeConfig(), []);
  const useLocalPreview = !config.apiKey && !config.webSceneId;

  useEffect(() => {
    if (useLocalPreview) {
      return undefined;
    }

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
        });
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
  }, [config, points, useLocalPreview]);

  if (useLocalPreview) {
    return (
      <section className={className} aria-label={title} role="region">
        <div className="arcgis-scene arcgis-scene--placeholder">
          <div className="arcgis-scene__grid" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="arcgis-scene__floors" aria-hidden="true">
            <span>T5</span>
            <span>T3</span>
            <span>T1</span>
          </div>
          {points.map((point, index) => (
            <span
              key={point.id}
              className="arcgis-scene__marker"
              style={
                {
                  '--marker-left': `${22 + index * 13}%`,
                  '--marker-top': `${62 - index * 11}%`,
                } as CSSProperties
              }
              title={`${point.title}${point.description ? ` - ${point.description}` : ''}`}
            >
              {index + 1}
            </span>
          ))}
          <div className="arcgis-scene__notice">
            <strong>Chế độ mô phỏng</strong>
            <span>Bản đồ ArcGIS thật sẽ hiển thị khi có API key hoặc WebScene ID.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className} aria-label={title} role="region">
      {error ? <p role="alert">{error}</p> : null}
      <div ref={containerRef} className="arcgis-scene" />
    </section>
  );
}
