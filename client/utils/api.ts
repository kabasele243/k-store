const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, body, ...fetchOptions } = options;

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Set Content-Type for requests with body
  if (body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    console.log(`Failed to fetch ${endpoint}: ${response.statusText}`);
    console.log({ response });
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}
