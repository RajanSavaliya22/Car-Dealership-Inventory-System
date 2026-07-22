function formatPrice(price) {
  const number = typeof price === "string" ? parseFloat(price) : price;
  return number.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function VehicleCard({ vehicle, onPurchase }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <article>
      <h3>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>
      <p>{formatPrice(vehicle.price)}</p>
      <p>{outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}</p>
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => onPurchase(vehicle.id)}
      >
        Purchase
      </button>
    </article>
  );
}