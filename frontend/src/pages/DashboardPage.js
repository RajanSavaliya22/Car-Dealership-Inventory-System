import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VehicleList from "../components/vehicles/VehicleList";

export default function DashboardPage() {
  const { logout, isAdmin } = useAuth();

  return (
    <div>
      <header>
        <h1>Available Vehicles</h1>
        {isAdmin && <Link to="/admin/vehicles">Manage Vehicles</Link>}
        <button type="button" onClick={logout}>
          Log Out
        </button>
      </header>
      <VehicleList />
    </div>
  );
}