import { useState } from "react";

const emptyValues = {
  make: "",
  model: "",
  year: "",
  price: "",
  quantity: "",
  description: "",
  image_url: "",
  category: "",
};

export default function VehicleForm({ initialValues, onSubmit, onCancel, hideTitle }) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });

  function handleChange(field) {
    return (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ margin: hideTitle ? '0' : '2rem 0', maxWidth: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
      {!hideTitle && (
        <div style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>{initialValues ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="vehicle-make">Make</label>
        <input
          id="vehicle-make"
          type="text"
          value={values.make}
          onChange={handleChange("make")}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="vehicle-model">Model</label>
        <input
          id="vehicle-model"
          type="text"
          value={values.model}
          onChange={handleChange("model")}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="vehicle-image">Image URL</label>
        <input
          id="vehicle-image"
          type="url"
          value={values.image_url}
          onChange={handleChange("image_url")}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="vehicle-category">Category</label>
        <select
          id="vehicle-category"
          value={values.category}
          onChange={handleChange("category")}
          required
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
      </div>
      <div className="form-group">
        <label htmlFor="vehicle-year">Year</label>
        <input
          id="vehicle-year"
          type="number"
          value={values.year}
          onChange={handleChange("year")}
          required
        />
      </div>

      <div className="form-group">
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
      <div className="form-group">
        <label htmlFor="vehicle-quantity">Quantity</label>
        <input
          id="vehicle-quantity"
          type="number"
          value={values.quantity}
          onChange={handleChange("quantity")}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="vehicle-description">Description</label>
        <textarea
          id="vehicle-description"
          value={values.description}
          onChange={handleChange("description")}
          style={{ minHeight: '60px', height: 'auto', resize: 'vertical' }}
        />
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.8rem 2rem' }}>Save</button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}