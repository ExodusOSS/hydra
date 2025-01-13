const createGetBuildMetadata = () => {
  return async () => ({
    appId: 'exodus',
    osName: 'android',
    build: 'genesis',
    version: '23.1.1',
    dev: false,
    platformName: 'Android',
  })
}

export default createGetBuildMetadata
