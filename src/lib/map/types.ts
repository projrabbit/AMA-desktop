export interface MapPoint {
  id: string;
  longitude: number;
  latitude: number;
  altitude?: number | null;
  title: string;
  description?: string;
}

export interface ArcgisSceneHandle {
  destroy(): void;
}
