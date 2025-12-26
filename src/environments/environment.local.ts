export const environment = {
  production: false,
  apiUrl: 'http://api-boukii.test/api',  // o la URL de tu API local
  wsConfig: {
    enabled: true,
    key: 'PUSHER_APP_KEY',
    cluster: 'mt1',
    wsHost: 'localhost',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws'],
  }
};
