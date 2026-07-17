const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let refreshSessionPromise = null;

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function refreshAccessToken() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => {
        if (response.status === 200) {
          return true;
        }

        throw new Error(`refresh_failed_${response.status}`);
      })
      .catch(() => {
        redirectToLogin();
        return false;
      })
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

export async function authFetch(input, init = {}) {
  const requestInit = {
    ...init,
    credentials: 'include',
  };

  if (refreshSessionPromise) {
    const refreshed = await refreshSessionPromise;
    if (!refreshed) {
      return null;
    }
  }

  let response = await fetch(input, requestInit);

  if (response.status === 205) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }

    response = await fetch(input, requestInit);
  }

  if (response.status === 401) {
    redirectToLogin();
    return null;
  }

  return response;
}

export { API_BASE_URL, redirectToLogin };