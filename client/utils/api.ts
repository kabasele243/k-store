const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    console.log(`Failed to fetch ${endpoint}: ${response.statusText}`);
    console.log({ response });
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}
