import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import { AuthProvider } from "../context/AuthContext";
import * as authApi from "../api/auth";

jest.mock("../api/auth");

function renderRegisterForm() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders registration form with username, email and password fields", () => {
    renderRegisterForm();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("submits entered values to register api", async () => {
    const user = userEvent.setup();
    authApi.register.mockResolvedValue({ id: 1, username: "jane", email: "jane@example.com" });

    renderRegisterForm();

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith("jane", "jane@example.com", "strongpass123");
    });
  });

  test("shows error when email is already registered", async () => {
    const user = userEvent.setup();
    authApi.register.mockRejectedValue({
      response: { data: { email: ["A user with this email already exists."] } },
    });

    renderRegisterForm();

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });

  test("redirects to login page after successful registration", async () => {
    const user = userEvent.setup();
    authApi.register.mockResolvedValue({ id: 1, username: "jane", email: "jane@example.com" });

    renderRegisterForm();

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });
});