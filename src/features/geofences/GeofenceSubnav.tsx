import { NavLink } from 'react-router-dom';

export function GeofenceSubnav() {
  return (
    <nav className="admin-nav" aria-label="Điều hướng vùng chấm công">
      <NavLink to="/geofences" end>
        Vùng chấm công
      </NavLink>
      <NavLink to="/geofences/buildings">Tòa nhà & tầng</NavLink>
    </nav>
  );
}
