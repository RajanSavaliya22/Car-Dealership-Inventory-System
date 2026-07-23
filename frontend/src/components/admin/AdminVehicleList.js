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

  const [formError, setFormError] = useState(null);

  function handleAddClick() {
    setFormError(null);
    setFormMode("add");
  }

  function handleEditClick(vehicle) {
    setFormError(null);
    setFormMode({ editing: vehicle });
  }

  function handleCancel() {
    setFormError(null);
    setFormMode(null);
  }

  async function handleSubmit(values) {
    setFormError(null);
    try {
      if (formMode === "add") {
        await vehiclesApi.createVehicle(values);
      } else if (formMode?.editing) {
        await vehiclesApi.updateVehicle(formMode.editing.id, values);
      }
      setFormMode(null);
      await loadVehicles();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const messages = Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`);
        setFormError(messages.join(" | "));
      } else {
        setFormError("Failed to save vehicle. Please check inputs.");
      }
    }
  }

  async function handleDelete(vehicleId) {
    try {
      await vehiclesApi.deleteVehicle(vehicleId);
      setVehicles((current) => current.filter((v) => v.id !== vehicleId));
    } catch (err) {
      setError("Failed to delete vehicle.");
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Vehicle Inventory</h2>
        {!formMode && (
          <button type="button" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={handleAddClick}>
            + Add Vehicle
          </button>
        )}
      </div>

      {formMode === "add" && (
        <VehicleForm onSubmit={handleSubmit} onCancel={handleCancel} errorMessage={formError} />
      )}

      {formMode?.editing && (
        <VehicleForm
          initialValues={formMode.editing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          errorMessage={formError}
        />
      )}

      {loading && <p>Loading vehicles...</p>}
      {error && <p className="alert-error" role="alert">{error}</p>}

      {!loading && !error && vehicles.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Make</th>
                <th>Model</th>
                <th>Category</th>
                <th>Year</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.category}</td>
                  <td>{vehicle.year}</td>
                  <td>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: vehicle.quantity > 0 ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                      color: vehicle.quantity > 0 ? '#2ed573' : '#ff4757',
                    }}>
                      {vehicle.quantity > 0 ? `${vehicle.quantity} In Stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => handleEditClick(vehicle)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDelete(vehicle.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}