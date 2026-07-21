import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

// TODO: implement once accounts/urls.py register/login endpoints exist
export async function login(email, password) {
  throw new Error("Not implemented yet");
}

export async function register(email, password) {
  throw new Error("Not implemented yet");
}
