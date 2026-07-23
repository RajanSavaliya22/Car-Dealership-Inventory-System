import { Link } from "react-router-dom";
import AdminVehicleList from "../components/admin/AdminVehicleList";

export default function AdminVehiclesPage() {
  return (
    <div className="app-container">
      <header className="page-header">
        <h1>Admin — Vehicle Management</h1>
        <div className="header-actions">
          <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </header>
      <AdminVehicleList />
    </div>
  );
}