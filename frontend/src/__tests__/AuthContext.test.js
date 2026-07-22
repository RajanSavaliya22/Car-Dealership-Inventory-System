import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";

jest.mock("../api/auth");

function Probe() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <span data-testid="user-email">{user?.email || "none"}</span>
    </div>
  );
}

describe("AuthContext - user profile / role", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("fetches and exposes user profile when a token already exists on mount", async () => {
    localStorage.setItem("access_token", "existing-token");
    authApi.fetchMe.mockResolvedValue({
      id: 1, username: "admin", email: "admin@example.com", role: "ADMIN", is_admin: true,
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("admin@example.com");
    });
    expect(screen.getByTestId("is-admin")).toHaveTextContent("true");
  });

  test("isAdmin is false for a customer profile", async () => {
    localStorage.setItem("access_token", "existing-token");
    authApi.fetchMe.mockResolvedValue({
      id: 2, username: "cust", email: "cust@example.com", role: "CUSTOMER", is_admin: false,
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("cust@example.com");
    });
    expect(screen.getByTestId("is-admin")).toHaveTextContent("false");
  });

  test("does not attempt to fetch profile when there is no token", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(authApi.fetchMe).not.toHaveBeenCalled();
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
  });
});