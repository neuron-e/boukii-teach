export const environment = {
  production: true,
  apiUrl: 'https://api.boukii.com/api',
  wsConfig: {
    enabled: false, // TODO: enable with production websocket host/keys
    key: 'PUSHER_APP_KEY',
    cluster: 'mt1',
    wsHost: 'localhost',
    wsPort: 6001,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  }
};
