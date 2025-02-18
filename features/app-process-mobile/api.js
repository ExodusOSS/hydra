const appProcessApiDefinition = {
  id: 'appProcessApi',
  type: 'api',
  factory: ({ appProcess }) => ({
    appProcess: {
      awaitState: appProcess.awaitState,
      awaitForeground: appProcess.awaitForeground,
      requestLockTimerExtension: appProcess.requestLockTimerExtension,
    },
  }),
  dependencies: ['appProcess'],
}

export default appProcessApiDefinition
