export const environment = {
  production: false,
  apiUrl: 'https://dev.api.boukii.com/api',
  wsConfig: {
    enabled: true,
    key: '0d1281165753592eacc0',
    cluster: 'eu',
    authEndpoint: 'https://dev.api.boukii.com/broadcasting/auth',
    // Leave wsHost/wsPort unset to use Pusher SaaS (cluster-based)
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  },
  beamsInstanceId: 'd0a6d82d-dced-40d8-8057-5a77c87ab250',
};
