import { Link } from "react-router-dom";
import AdminVehicleList from "../components/admin/AdminVehicleList";

export default function AdminVehiclesPage() {
  return (
    <div>
      <header>
        <h1>Admin — Vehicle Management</h1>
        <Link to="/dashboard">Back to Dashboard</Link>
      </header>
      <AdminVehicleList />
    </div>
  );
}