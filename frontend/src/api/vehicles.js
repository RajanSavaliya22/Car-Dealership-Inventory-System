import client from "./auth";

export async function fetchVehicles(params = {}) {
  const response = await client.get("/vehicles/", { params });
  return response.data; // { count, next, previous, results }
}

export async function createVehicle(data) {
  const response = await client.post("/vehicles/", data);
  return response.data;
}

export async function updateVehicle(id, data) {
  const response = await client.patch(`/vehicles/${id}/`, data);
  return response.data;
}

export async function deleteVehicle(id) {
  await client.delete(`/vehicles/${id}/`);
}

export async function purchaseVehicle(vehicleId) {
  const response = await client.post(`/transactions/purchase/`, { vehicle: vehicleId });
  return response.data;
}