declare const PusherPushNotifications: {
  Client: new (options: { instanceId: string }) => {
    start: () => Promise<void>;
    addDeviceInterest: (interest: string) => Promise<void>;
    removeDeviceInterest?: (interest: string) => Promise<void>;
    getDeviceInterests?: () => Promise<string[]>;
    stop?: () => Promise<void>;
  };
};
