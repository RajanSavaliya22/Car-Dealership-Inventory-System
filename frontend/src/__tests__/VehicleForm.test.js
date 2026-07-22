import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehicleForm from "../components/admin/VehicleForm";

describe("VehicleForm", () => {
  test("renders all vehicle fields empty in create mode", () => {
    render(<VehicleForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/make/i)).toHaveValue("");
    expect(screen.getByLabelText(/model/i)).toHaveValue("");
    expect(screen.getByLabelText(/year/i)).toHaveValue(null);
    expect(screen.getByLabelText(/price/i)).toHaveValue(null);
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(null);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("pre-fills fields when initialValues provided (edit mode)", () => {
    render(
      <VehicleForm
        onSubmit={jest.fn()}
        initialValues={{
          make: "Toyota", model: "Corolla", year: 2023, price: "21000.00", quantity: 5, description: "",
        }}
      />
    );

    expect(screen.getByLabelText(/make/i)).toHaveValue("Toyota");
    expect(screen.getByLabelText(/model/i)).toHaveValue("Corolla");
    expect(screen.getByLabelText(/year/i)).toHaveValue(2023);
  });

  test("submits entered values", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<VehicleForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/make/i), "Ford");
    await user.type(screen.getByLabelText(/model/i), "Focus");
    await user.type(screen.getByLabelText(/year/i), "2024");
    await user.type(screen.getByLabelText(/price/i), "22000");
    await user.type(screen.getByLabelText(/quantity/i), "3");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          make: "Ford",
          model: "Focus",
          year: "2024",
          price: "22000",
          quantity: "3",
        })
      );
    });
  });
});