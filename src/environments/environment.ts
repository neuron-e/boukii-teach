// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  apiUrl: 'https://api.boukii.com/api',
  wsConfig: {
    enabled: true,
    key: '0d1281165753592eacc0',
    cluster: 'eu',
    authEndpoint: 'https://api.boukii.com/broadcasting/auth',
    // Leave wsHost/wsPort unset to use Pusher SaaS (cluster-based)
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  },
  beamsInstanceId: 'd0a6d82d-dced-40d8-8057-5a77c87ab250',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
