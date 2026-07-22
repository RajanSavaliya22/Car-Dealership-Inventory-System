import { Link } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div>
      <h1>Create an Account</h1>
      <RegisterForm />
      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}