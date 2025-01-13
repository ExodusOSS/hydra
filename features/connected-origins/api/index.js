const connectedOriginsApi = ({ connectedOrigins, connectedOriginsAtom }) => ({
  connectedOrigins: {
    get: connectedOriginsAtom.get,
    add: connectedOrigins.add,
    clear: connectedOrigins.clear,
    untrust: connectedOrigins.untrust,
    isTrusted: connectedOrigins.isTrusted,
    isAutoApprove: connectedOrigins.isAutoApprove,
    setFavorite: connectedOrigins.setFavorite,
    setAutoApprove: connectedOrigins.setAutoApprove,
    connect: connectedOrigins.connect,
    disconnect: connectedOrigins.disconnect,
    updateConnection: connectedOrigins.updateConnection,
    clearConnections: connectedOrigins.clearConnections,
  },
})

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'connectedOriginsApi',
  type: 'api',
  factory: connectedOriginsApi,
  dependencies: ['connectedOrigins', 'connectedOriginsAtom'],
}
