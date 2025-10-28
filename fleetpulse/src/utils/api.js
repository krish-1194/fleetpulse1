const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const setAccessToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAccessToken = () => {
  return localStorage.getItem('token');
};

export const clearTokens = async () => {
  localStorage.removeItem('token');
  // Make a backend call to clear the HTTP-only refresh token cookie
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: send cookies with the request
    });
  } catch (error) {
    console.error("Error clearing refresh token on backend:", error);
  }
};

// Custom fetch wrapper with token refresh logic
export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = getAccessToken();
  let headers = options.headers || {};

  // Attach access token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  options.headers = headers;
  options.credentials = options.credentials || 'include'; // Always send cookies for refresh token

  let response = await fetch(url, options);

  // If unauthorized and not a refresh token request, attempt to refresh token
  if (response.status === 401 && url !== `${API_BASE_URL}/api/auth/refresh`) {
    console.log("Access token expired, attempting to refresh...");
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken } = await refreshResponse.json();
      setAccessToken(newAccessToken);
      console.log("Access token refreshed. Retrying original request...");

      // Retry the original request with the new access token
      options.headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    } else {
      console.log("Failed to refresh token. Redirecting to login...");
      await clearTokens();
      throw new Error("Failed to refresh token, user logged out.");
    }
  }

  return response;
};
