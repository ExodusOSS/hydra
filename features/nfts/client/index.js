import createNftsProxy from './nfts-proxy'

const nftsProxyDefinition = {
  id: 'nftsProxy',
  // TODO: support client type?
  type: 'module',
  factory: createNftsProxy,
  dependencies: ['config', 'fetch'],
  public: true,
}

export default nftsProxyDefinition
