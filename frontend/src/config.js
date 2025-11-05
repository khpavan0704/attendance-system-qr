// Centralized API base URL. Uses current host by default so other devices can connect.
const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = 5000; // Flask backend port
  return `${protocol}//${hostname}:${port}`;
};

export const API_BASE = getApiBase();

