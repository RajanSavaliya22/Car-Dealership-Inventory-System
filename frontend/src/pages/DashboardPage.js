import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VehicleList from "../components/vehicles/VehicleList";

export default function DashboardPage() {
  const { logout, isAdmin } = useAuth();

  return (
    <div className="app-container">
      <header className="page-header">
        <h1>Available Vehicles</h1>
        <div className="header-actions">
          {isAdmin && <Link to="/admin/vehicles" className="btn-secondary">Manage Vehicles</Link>}
          <button type="button" className="btn-primary" onClick={logout} style={{ width: 'auto', padding: '0.6rem 1.2rem', margin: 0 }}>
            Log Out
          </button>
        </div>
      </header>
      <VehicleList />
    </div>
  );
}