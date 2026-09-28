export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const storageKeys = {
  access: "access",
  refresh: "refresh",
  user: "user",
  roles: "rolesNew",
  permissions: "permissionsNew",
};

export const saveAuthSession = (payload) => {
  if (payload.access) localStorage.setItem(storageKeys.access, payload.access);
  if (payload.refresh) localStorage.setItem(storageKeys.refresh, payload.refresh);
  localStorage.setItem(storageKeys.user, JSON.stringify(payload.user ?? {}));
  localStorage.setItem(storageKeys.roles, JSON.stringify(payload.rolesNew ?? []));
  localStorage.setItem(storageKeys.permissions, JSON.stringify(payload.permissionsNew ?? []));
};

export const clearAuthSession = () => {
  Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
};

export const getRefreshToken = () => localStorage.getItem(storageKeys.refresh);

export const apiFetch = (path, options = {}) => {
  const headers = new Headers(options.headers);
  const access = localStorage.getItem(storageKeys.access);

  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
  return fetch(url, { ...options, headers });
};
