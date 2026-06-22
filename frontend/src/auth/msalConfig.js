export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173',
  },
  cache: { cacheLocation: 'sessionStorage' },
};

export const loginRequest = { scopes: ['openid', 'profile', 'email'] };