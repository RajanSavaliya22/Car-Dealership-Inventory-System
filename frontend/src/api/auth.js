import axios from "axios";



const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

const client = axios.create({ baseURL: API_BASE });

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

export async function login(email, password) {
  const response = await client.post("/auth/login/", { email, password }, { headers: { Authorization: undefined } });
  return response.data; // { access, refresh }
}

export async function register(username, email, password) {
  const response = await client.post("/auth/register/", { username, email, password }, { headers: { Authorization: undefined } });
  return response.data;
}

export async function fetchMe() {
  const response = await client.get("/auth/me/");
  return response.data; // { id, username, email, role, is_admin }
}

export default client;