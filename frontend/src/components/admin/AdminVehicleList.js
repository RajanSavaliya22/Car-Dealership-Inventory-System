import { useEffect, useState, useCallback } from "react";
import * as vehiclesApi from "../../api/vehicles";
import VehicleForm from "./VehicleForm";

export default function AdminVehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | "add" | { editing: vehicle }

  const loadVehicles = useCallback(() => {
    setLoading(true);
    return vehiclesApi
      .fetchVehicles()
      .then((data) => setVehicles(data.results || []))
      .catch(() => setError("Unable to load vehicles."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  function handleAddClick() {
    setFormMode("add");
  }

  function handleEditClick(vehicle) {
    setFormMode({ editing: vehicle });
  }

  function handleCancel() {
    setFormMode(null);
  }

  async function handleSubmit(values) {
    if (formMode === "add") {
      await vehiclesApi.createVehicle(values);
    } else if (formMode?.editing) {
      await vehiclesApi.updateVehicle(formMode.editing.id, values);
    }
    setFormMode(null);
    await loadVehicles();
  }

  async function handleDelete(vehicleId) {
    await vehiclesApi.deleteVehicle(vehicleId);
    setVehicles((current) => current.filter((v) => v.id !== vehicleId));
  }

  return (
    <div>
      <h2>Manage Vehicles</h2>

      {!formMode && (
        <button type="button" onClick={handleAddClick}>
          Add Vehicle
        </button>
      )}

      {formMode === "add" && (
        <VehicleForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}

      {formMode?.editing && (
        <VehicleForm
          initialValues={formMode.editing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {loading && <p>Loading vehicles...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            <span>
              {vehicle.year} {vehicle.make} {vehicle.model} — Qty: {vehicle.quantity}
            </span>
            <button type="button" onClick={() => handleEditClick(vehicle)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(vehicle.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}