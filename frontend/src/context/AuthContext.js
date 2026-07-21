import { createContext, useContext } from "react";

// TODO (Phase A frontend, RED step):
// Write src/__tests__/LoginForm.test.js first:
//   - renders login form with email and password fields
//   - shows error on invalid login
//   - redirects to dashboard on successful login
//   - stores token and attaches to future requests
// Then implement AuthProvider (state: user, token) + useAuth() hook here.

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
