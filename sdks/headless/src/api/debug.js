const createApi = ({ ioc, port, debug }) => {
  if (!debug) return

  const apis = ioc.getByType('debug')

  const { unsafeStorage } = ioc.getByType('adapter')

  const { blockchainMetadata } = ioc.getByType('module')

  const restart = async () => {
    // TODO: clever way to know what to invalidate
    await blockchainMetadata.clear()
    port.emit('restart', { reason: 'debug' })
  }

  const clear = async () => {
    await unsafeStorage.namespace('debug').clear()
    await restart()
  }

  return Object.assign({}, ...Object.values(apis), { clear, restart })
}

export default createApi
