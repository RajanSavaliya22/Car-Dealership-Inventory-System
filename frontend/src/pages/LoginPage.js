import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div>
      <h1>Log In</h1>
      <LoginForm />
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}