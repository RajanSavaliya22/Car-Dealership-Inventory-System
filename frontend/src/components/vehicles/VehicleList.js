import { useEffect, useState } from "react";
import * as vehiclesApi from "../../api/vehicles";
import VehicleCard from "./VehicleCard";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseErrors, setPurchaseErrors] = useState({});

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    const params = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (category) params.category = category;
    if (year) params.year = year;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

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
  }, [make, model, category, year, minPrice, maxPrice]);

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
      <div className="glass-panel" style={{ margin: '0 0 2rem 0', maxWidth: 'none', display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flexGrow: 1 }}>
          <input
            id="vehicle-search-make"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Make (e.g. Toyota)"
            style={{ flex: '1 1 140px', minWidth: '140px' }}
          />
          <input
            id="vehicle-search-model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Model (e.g. Camry)"
            style={{ flex: '1 1 140px', minWidth: '140px' }}
          />
          <select
            id="vehicle-search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ flex: '1 1 140px', minWidth: '140px' }}
          >
            <option value="">All Categories</option>
            <option value="Sports">Sports</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
            <option value="Coupe">Coupe</option>
            <option value="Convertible">Convertible</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Minivan">Minivan</option>
            <option value="Electric">Electric</option>
          </select>
          <input
            id="vehicle-year"
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            style={{ flex: '1 1 100px', minWidth: '100px' }}
          />
          <input
            id="vehicle-min-price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min $ Price"
            style={{ flex: '1 1 120px', minWidth: '120px' }}
          />
          <input
            id="vehicle-max-price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max $ Price"
            style={{ flex: '1 1 120px', minWidth: '120px' }}
          />
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading vehicles...</p>}
      {error && <p className="alert-error" role="alert">{error}</p>}

      {!loading && !error && vehicles.length === 0 && <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>No vehicles found.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
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