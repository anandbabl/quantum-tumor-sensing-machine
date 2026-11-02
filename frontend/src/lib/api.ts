// API Client for Quantum Tumor Sensing Machine Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint.startsWith("/api") ? cleanEndpoint : `/api${cleanEndpoint}`}`;
};

export const getAssetUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Auto set JSON content-type if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    const rawMsg = netErr?.message || String(netErr);
    if (rawMsg.includes("Load failed") || rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError")) {
      throw new Error(
        `Cannot reach backend API at ${API_BASE_URL}. If running in production, ensure your backend Web Service is running on Render and NEXT_PUBLIC_API_URL is configured in your Vercel project settings.`
      );
    }
    throw netErr;
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `HTTP error ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
