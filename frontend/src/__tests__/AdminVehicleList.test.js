import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminVehicleList from "../components/admin/AdminVehicleList";
import * as vehiclesApi from "../api/vehicles";

jest.mock("../api/vehicles");

const mockVehicles = [
  { id: 1, make: "Toyota", model: "Corolla", year: 2023, price: "21000.00", quantity: 5, is_in_stock: true },
];

describe("AdminVehicleList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vehiclesApi.fetchVehicles.mockResolvedValue({ results: mockVehicles, count: 1 });
  });

  test("renders vehicles with edit and delete controls", async () => {
    render(<AdminVehicleList />);

    expect(await screen.findByText(/Corolla/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  test("shows add vehicle form when 'Add Vehicle' is clicked", async () => {
    const user = userEvent.setup();
    render(<AdminVehicleList />);
    await screen.findByText(/Corolla/i);

    await user.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
  });

  test("submitting the add form calls createVehicle and refreshes the list", async () => {
    const user = userEvent.setup();
    vehiclesApi.createVehicle.mockResolvedValue({ id: 2, make: "Ford", model: "Focus" });
    render(<AdminVehicleList />);
    await screen.findByText(/Corolla/i);

    await user.click(screen.getByRole("button", { name: /add vehicle/i }));
    await user.type(screen.getByLabelText(/make/i), "Ford");
    await user.type(screen.getByLabelText(/model/i), "Focus");
    await user.type(screen.getByLabelText(/year/i), "2024");
    await user.type(screen.getByLabelText(/price/i), "22000");
    await user.type(screen.getByLabelText(/quantity/i), "3");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(vehiclesApi.createVehicle).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(vehiclesApi.fetchVehicles).toHaveBeenCalledTimes(2); // initial + after create
    });
  });

  test("clicking edit pre-fills form and submitting calls updateVehicle", async () => {
    const user = userEvent.setup();
    vehiclesApi.updateVehicle.mockResolvedValue({ ...mockVehicles[0], quantity: 10 });
    render(<AdminVehicleList />);
    await screen.findByText(/Corolla/i);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, "10");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(vehiclesApi.updateVehicle).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ quantity: "10" })
      );
    });
  });

  test("clicking delete calls deleteVehicle and removes it from the list", async () => {
    const user = userEvent.setup();
    vehiclesApi.deleteVehicle.mockResolvedValue();
    render(<AdminVehicleList />);
    await screen.findByText(/Corolla/i);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(vehiclesApi.deleteVehicle).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(screen.queryByText(/Corolla/i)).not.toBeInTheDocument();
    });
  });
});