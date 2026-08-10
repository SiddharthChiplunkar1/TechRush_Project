// Access tokens are deliberately memory-only. Refresh credentials live in the
// backend-issued HttpOnly cookie and are never readable by JavaScript.
let accessToken = null;
let accessTokenExpiry = null;

const tokenStorage = {
  get: () => accessToken,
  set: (token, expiresInSeconds = 900) => {
    accessToken = token;
    accessTokenExpiry = Date.now() + Number(expiresInSeconds) * 1000;
  },
  expiresAt: () => accessTokenExpiry,
  isExpired: () => accessTokenExpiry !== null && accessTokenExpiry <= Date.now(),
  clear: () => { accessToken = null; accessTokenExpiry = null; }
};

// User profiles are not credentials, but keeping them in memory avoids
// persisting personally identifiable account data in browser storage.
let currentUser = null;
const userStorage = {
  get: () => currentUser,
  set: (user) => { currentUser = user; },
  clear: () => { currentUser = null; }
};

export { tokenStorage, userStorage };
