import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehicleCard from "../components/vehicles/VehicleCard";

const inStockVehicle = {
  id: 1,
  make: "Toyota",
  model: "Corolla",
  year: 2023,
  price: "21000.00",
  quantity: 5,
  is_in_stock: true,
};

const outOfStockVehicle = {
  id: 2,
  make: "Honda",
  model: "Civic",
  year: 2022,
  price: "19000.00",
  quantity: 0,
  is_in_stock: false,
};

describe("VehicleCard", () => {
  test("renders vehicle make, model, year and price", () => {
    render(<VehicleCard vehicle={inStockVehicle} onPurchase={jest.fn()} />);

    expect(screen.getByText(/2023 Toyota Corolla/i)).toBeInTheDocument();
    expect(screen.getByText(/21,?000/)).toBeInTheDocument();
  });

  test("purchase button is enabled when quantity is greater than zero", () => {
    render(<VehicleCard vehicle={inStockVehicle} onPurchase={jest.fn()} />);

    expect(screen.getByRole("button", { name: /purchase/i })).toBeEnabled();
  });

  test("purchase button is disabled when quantity is zero", () => {
    render(<VehicleCard vehicle={outOfStockVehicle} onPurchase={jest.fn()} />);

    expect(screen.getByRole("button", { name: /purchase/i })).toBeDisabled();
  });

  test("shows out of stock label when quantity is zero", () => {
    render(<VehicleCard vehicle={outOfStockVehicle} onPurchase={jest.fn()} />);

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  test("clicking purchase calls onPurchase with the vehicle id", async () => {
    const user = userEvent.setup();
    const onPurchase = jest.fn();
    render(<VehicleCard vehicle={inStockVehicle} onPurchase={onPurchase} />);

    await user.click(screen.getByRole("button", { name: /purchase/i }));

    expect(onPurchase).toHaveBeenCalledWith(1);
  });
});