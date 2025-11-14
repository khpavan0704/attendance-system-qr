// Centralized API base URL.
// You can override the API base at build/start time using the
// environment variable REACT_APP_API_BASE (useful when using ngrok).
const getApiBase = () => {
  // If REACT_APP_API_BASE is set at build time, CRA will replace process.env.REACT_APP_API_BASE
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  const { protocol, hostname } = window.location;
  const port = 5000; // Flask backend port
  return `${protocol}//${hostname}:${port}`;
};

export const API_BASE = getApiBase();

