import "./VehicleCard.css";

function formatPrice(price) {
  const number = typeof price === "string" ? parseFloat(price) : price;
  return number.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function VehicleCard({ vehicle, onPurchase, purchasing = false, purchaseError = null }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <article className="figma-card">
      <div className="figma-card-image">
        <img src={vehicle.image_url || `https://images.unsplash.com/photo-1549317661-bc32c0734c89?auto=format&fit=crop&w=400&q=80&sig=${vehicle.id}`} alt={`${vehicle.make} ${vehicle.model}`} />
      </div>

      <div className="figma-card-content">
        <div className="figma-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{vehicle.make}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="figma-card-title" style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.2 }}>{vehicle.model}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 600, marginLeft: '0.5rem' }}>{vehicle.category}</span>
          </div>
          <p className="figma-card-subtitle" style={{ margin: '0.25rem 0 0 0' }}>{outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}</p>
        </div>

        <div className="figma-card-grid">
          <div className="figma-card-row">
            <span className="figma-row-label">Model Year:</span>
            <span className="figma-row-value">{vehicle.year}</span>
          </div>
          <div className="figma-card-row">
            <span className="figma-row-label">Category:</span>
            <span className="figma-row-value">{vehicle.category}</span>
          </div>
          <div className="figma-card-row">
            <span className="figma-row-label">Make:</span>
            <span className="figma-row-value">{vehicle.make}</span>
          </div>
        </div>

        <div className="figma-card-footer">
          <p className="figma-card-price">{formatPrice(vehicle.price)}</p>
          <button
            className="figma-card-btn"
            type="button"
            disabled={outOfStock || purchasing}
            onClick={() => onPurchase(vehicle.id)}
          >
            {purchasing ? "Processing..." : "Order Now"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {purchaseError && <p className="figma-error-msg" role="alert">{purchaseError}</p>}
      </div>
    </article>
  );
}