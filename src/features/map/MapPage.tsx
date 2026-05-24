import { ArcgisScene } from '@/components/map/ArcgisScene';
import { mockRealtimeLocations } from '@/lib/mocks';

export function MapPage() {
  return (
    <div className="screen-stack">
      <h1>Bản đồ 3D</h1>
      <ArcgisScene
        title="Bản đồ 3D"
        points={mockRealtimeLocations.map((location) => ({
          id: String(location.employee_id),
          longitude: location.longitude,
          latitude: location.latitude,
          altitude: location.altitude,
          title: location.full_name,
          description: location.department_name,
        }))}
      />
    </div>
  );
}
