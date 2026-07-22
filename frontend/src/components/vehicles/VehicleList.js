import { useEffect, useState } from "react";
import * as vehiclesApi from "../../api/vehicles";
import VehicleCard from "./VehicleCard";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseErrors, setPurchaseErrors] = useState({});

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    const params = {};
    if (search) params.search = search;
    if (year) params.year = year;

    vehiclesApi
      .fetchVehicles(params)
      .then((data) => {
        if (isCurrent) {
          setVehicles(data.results || []);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError("Unable to load vehicles. Please try again.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [search, year]);

  function handlePurchase(vehicleId) {
    setPurchasingId(vehicleId);
    setPurchaseErrors((prev) => ({ ...prev, [vehicleId]: null }));

    vehiclesApi
      .purchaseVehicle(vehicleId)
      .then(() => {
        setVehicles((current) =>
          current.map((v) =>
            v.id === vehicleId
              ? { ...v, quantity: v.quantity - 1, is_in_stock: v.quantity - 1 > 0 }
              : v
          )
        );
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        const message = Array.isArray(detail)
          ? detail[0]
          : detail || "Unable to complete purchase. Please try again.";
        setPurchaseErrors((prev) => ({ ...prev, [vehicleId]: message }));
      })
      .finally(() => {
        setPurchasingId(null);
      });
  }

  return (
    <div>
      <div>
        <label htmlFor="vehicle-search">Search</label>
        <input
          id="vehicle-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by make or model"
        />

        <label htmlFor="vehicle-year">Year</label>
        <input
          id="vehicle-year"
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Filter by year"
        />
      </div>

      {loading && <p>Loading vehicles...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && vehicles.length === 0 && <p>No vehicles found.</p>}

      <div>
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPurchase={handlePurchase}
            purchasing={purchasingId === vehicle.id}
            purchaseError={purchaseErrors[vehicle.id]}
          />
        ))}
      </div>
    </div>
  );
}