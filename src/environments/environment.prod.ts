export const environment = {
  production: true,
  apiUrl: 'https://api.boukii.com/api',
  wsConfig: {
    enabled: true,
    key: 'PUSHER_APP_KEY',
    cluster: 'mt1',
    wsHost: 'api.boukii.com',
    wsPort: 6001,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  }
};
