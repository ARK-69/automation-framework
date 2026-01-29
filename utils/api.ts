import fetch from "node-fetch";

const API_BASE =
  process.env.API_BASE || process.env.BASE_URL || "https://example.com";

export async function apiSearchVehicle(vin: string) {
  if (!vin) return { results: [] };
  const url = `${API_BASE}/api/vehicles?vin=${encodeURIComponent(vin)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { results: [] };
    return await res.json();
  } catch (e) {
    return { results: [] };
  }
}

export function makeVin(): string {
  return "VIN" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
