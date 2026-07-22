import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthContext from "../context/AuthContext";

function renderWithAuth({ token, isAdmin = false }, { adminOnly = false } = {}) {
  return render(
    <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), isAdmin }}>
      <MemoryRouter initialEntries={["/admin/vehicles"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Redirect Target</div>} />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute adminOnly={adminOnly}>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("ProtectedRoute", () => {
  test("redirects to login when there is no token", () => {
    renderWithAuth({ token: null });

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument();
  });

  test("renders children when authenticated", () => {
    renderWithAuth({ token: "fake-token" });

    expect(screen.getByText(/admin content/i)).toBeInTheDocument();
  });

  test("redirects non-admin users away from an adminOnly route", () => {
    renderWithAuth({ token: "fake-token", isAdmin: false }, { adminOnly: true });

    expect(screen.getByText(/dashboard redirect target/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument();
  });

  test("allows admin users through an adminOnly route", () => {
    renderWithAuth({ token: "fake-token", isAdmin: true }, { adminOnly: true });

    expect(screen.getByText(/admin content/i)).toBeInTheDocument();
  });
});