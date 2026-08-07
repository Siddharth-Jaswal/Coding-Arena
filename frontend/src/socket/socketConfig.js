const isProd = import.meta.env.PROD;
// Assuming backend runs on 5000 locally and relative path in production
export const SOCKET_URL = isProd ? window.location.origin : 'http://localhost:5000';

export const SOCKET_OPTIONS = {
  autoConnect: false, // We connect manually when auth is ready
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};
