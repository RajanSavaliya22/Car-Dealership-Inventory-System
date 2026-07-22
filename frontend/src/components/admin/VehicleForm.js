import { useState } from "react";

const emptyValues = {
  make: "",
  model: "",
  year: "",
  price: "",
  quantity: "",
  description: "",
};

export default function VehicleForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });

  function handleChange(field) {
    return (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="vehicle-make">Make</label>
        <input
          id="vehicle-make"
          type="text"
          value={values.make}
          onChange={handleChange("make")}
          required
        />
      </div>
      <div>
        <label htmlFor="vehicle-model">Model</label>
        <input
          id="vehicle-model"
          type="text"
          value={values.model}
          onChange={handleChange("model")}
          required
        />
      </div>
      <div>
        <label htmlFor="vehicle-year">Year</label>
        <input
          id="vehicle-year"
          type="number"
          value={values.year}
          onChange={handleChange("year")}
          required
        />
      </div>
      <div>
        <label htmlFor="vehicle-price">Price</label>
        <input
          id="vehicle-price"
          type="number"
          step="0.01"
          value={values.price}
          onChange={handleChange("price")}
          required
        />
      </div>
      <div>
        <label htmlFor="vehicle-quantity">Quantity</label>
        <input
          id="vehicle-quantity"
          type="number"
          value={values.quantity}
          onChange={handleChange("quantity")}
          required
        />
      </div>
      <div>
        <label htmlFor="vehicle-description">Description</label>
        <textarea
          id="vehicle-description"
          value={values.description}
          onChange={handleChange("description")}
        />
      </div>
      <button type="submit">Save</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}