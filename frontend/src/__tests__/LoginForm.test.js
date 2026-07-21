import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { AuthProvider } from "../context/AuthContext";
import * as authApi from "../api/auth";

jest.mock("../api/auth");

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders login form with email and password fields", () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("shows error on invalid login", async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue({
      response: { data: { detail: "No active account found with the given credentials" } },
    });

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/no active account found/i)).toBeInTheDocument();
  });

  test("calls login api with entered credentials on submit", async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ access: "fake-access", refresh: "fake-refresh" });

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("jane@example.com", "strongpass123");
    });
  });

  test("redirects to dashboard on successful login", async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ access: "fake-access", refresh: "fake-refresh" });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/dashboard page/i)).toBeInTheDocument();
  });

  test("stores token after successful login", async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ access: "fake-access", refresh: "fake-refresh" });

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "strongpass123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBe("fake-access");
    });
  });
});