import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../components/auth/LoginForm";

describe("LoginForm", () => {
  test("renders login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  // Next tests to add once the above is GREEN:
  // test("shows error on invalid login", async () => { ... });
  // test("redirects to dashboard on successful login", async () => { ... });
  // test("stores token and attaches it to future requests", async () => { ... });
});
