const rawMode = (import.meta.env.VITE_APP_MODE || import.meta.env.MODE || (import.meta.env.PROD ? 'prod' : 'local')).toLowerCase();
const isProdMode = rawMode === 'prod' || rawMode === 'production';

export const SOCKET_URL = isProdMode
  ? (import.meta.env.VITE_PROD_WS_URL || import.meta.env.VITE_WS_URL || import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL || window.location.origin)
  : (import.meta.env.VITE_LOCAL_WS_URL || import.meta.env.VITE_WS_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000');

export const SOCKET_OPTIONS = {
  autoConnect: false, // We connect manually when auth is ready
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};
