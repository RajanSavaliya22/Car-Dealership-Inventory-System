import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehicleList from "../components/vehicles/VehicleList";
import * as vehiclesApi from "../api/vehicles";

jest.mock("../api/vehicles");

const mockVehicles = [
  { id: 1, make: "Toyota", model: "Corolla", year: 2023, price: "21000.00", quantity: 5, is_in_stock: true },
  { id: 2, make: "Honda", model: "Civic", year: 2022, price: "19000.00", quantity: 0, is_in_stock: false },
];

describe("VehicleList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vehiclesApi.fetchVehicles.mockResolvedValue({ results: mockVehicles, count: 2 });
  });

  test("renders list of vehicles fetched from the api", async () => {
    render(<VehicleList />);

    expect(await screen.findByText(/2023 Toyota Corolla/i)).toBeInTheDocument();
    expect(screen.getByText(/2022 Honda Civic/i)).toBeInTheDocument();
  });

  test("shows a loading state before vehicles arrive", () => {
    vehiclesApi.fetchVehicles.mockReturnValue(new Promise(() => {})); // never resolves
    render(<VehicleList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("search input triggers a filtered api call", async () => {
    const user = userEvent.setup();
    render(<VehicleList />);
    await screen.findByText(/2023 Toyota Corolla/i);

    await user.type(screen.getByLabelText(/search/i), "Honda");

    await waitFor(() => {
      expect(vehiclesApi.fetchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Honda" })
      );
    });
  });

  test("year filter triggers a filtered api call", async () => {
    const user = userEvent.setup();
    render(<VehicleList />);
    await screen.findByText(/2023 Toyota Corolla/i);

    await user.type(screen.getByLabelText(/year/i), "2022");

    await waitFor(() => {
      expect(vehiclesApi.fetchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ year: "2022" })
      );
    });
  });

  test("purchase button is disabled for out-of-stock vehicle in the list", async () => {
    render(<VehicleList />);
    await screen.findByText(/2022 Honda Civic/i);

    const buttons = screen.getAllByRole("button", { name: /purchase/i });
    const disabledButton = buttons.find((b) => b.disabled);

    expect(disabledButton).toBeTruthy();
  });

  test("shows an error on the card when purchase fails and does not decrement quantity", async () => {
    const user = userEvent.setup();
    vehiclesApi.purchaseVehicle.mockRejectedValue({
      response: { data: { detail: "Not enough stock available to complete this purchase." } },
    });

    render(<VehicleList />);
    await screen.findByText(/2023 Toyota Corolla/i);

    await user.click(screen.getAllByRole("button", { name: /purchase/i })[0]);

    expect(
      await screen.findByText(/not enough stock available/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/5 in stock/i)).toBeInTheDocument(); // unchanged
  });

  test("decrements quantity on the card after a successful purchase", async () => {
    const user = userEvent.setup();
    vehiclesApi.purchaseVehicle.mockResolvedValue({ id: 101, quantity: 1 });

    render(<VehicleList />);
    await screen.findByText(/2023 Toyota Corolla/i);

    await user.click(screen.getAllByRole("button", { name: /purchase/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/4 in stock/i)).toBeInTheDocument();
    });
  });
});