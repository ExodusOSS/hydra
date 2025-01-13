import lodash from 'lodash'

const { uniqBy } = lodash

class ConnectedOrigins {
  #connectedOriginsAtom = null

  constructor({ connectedOriginsAtom }) {
    this.#connectedOriginsAtom = connectedOriginsAtom
  }

  #getData = async () => {
    return this.#connectedOriginsAtom.get()
  }

  #setData = async (data) => {
    return this.#connectedOriginsAtom.set(data)
  }

  #setAttributes = async ({ origin, attributes }) => {
    const item = await this.#getOrigin({ origin })

    if (!item) return

    const data = await this.#getData()

    const newData = data.map((connection) => {
      if (origin !== connection.origin) return connection
      return { ...connection, ...attributes }
    })

    await this.#setData(newData)
  }

  #getOrigin = async ({ origin }) => {
    const data = await this.#getData()
    return data.find((value) => value.origin === origin)
  }

  clear = async () => {
    await this.#connectedOriginsAtom.set(undefined)
  }

  #addNewItem = async ({
    origin,
    name,
    icon,
    connectedAssetName,
    assetNames,
    trusted = false,
    favorite = false,
    walletAccount,
  }) => {
    const newOrigin = {
      origin,
      icon,
      name,
      trusted,
      favorite,
      connectedAssetName,
      assetNames,
      autoApprove: false,
      createdAt: Date.now(),
      activeConnections: [],
      walletAccount,
    }

    const data = await this.#getData()
    const newData = [...data, newOrigin]

    await this.#setData(newData)
  }

  add = async ({
    connectedAssetName,
    origin,
    name,
    icon,
    assetNames = [],
    trusted,
    favorite,
    walletAccount,
  }) => {
    const value = await this.#getOrigin({ origin })

    const allConnectedAssetNames = new Set([
      connectedAssetName,
      ...assetNames,
      ...(value?.assetNames ?? []),
    ])

    if (value) {
      await this.#setAttributes({
        origin,
        attributes: {
          icon: icon ?? value.icon,
          name: name ?? value.name,
          connectedAssetName: connectedAssetName ?? value.connectedAssetName,
          trusted: trusted ?? value.trusted,
          favorite: favorite ?? value.favorite,
          assetNames: [...allConnectedAssetNames],
          walletAccount: walletAccount ?? value.walletAccount,
        },
      })

      return
    }

    await this.#addNewItem({
      origin,
      icon,
      name,
      connectedAssetName,
      trusted,
      favorite,
      assetNames: [...allConnectedAssetNames],
      walletAccount,
    })
  }

  untrust = async ({ origin }) => {
    const isTrusted = await this.isTrusted({ origin })

    if (!isTrusted) return

    const data = await this.#getData()
    const newData = data.filter((connection) => connection.origin !== origin)

    await this.#setData(newData)
  }

  isTrusted = async ({ origin }) => {
    const value = await this.#getOrigin({ origin })

    if (!value) {
      return false
    }

    // backward compatibility
    return value.trusted === undefined || value.trusted
  }

  isAutoApprove = async ({ origin }) => {
    const value = await this.#getOrigin({ origin })
    return value?.autoApprove || false
  }

  setAutoApprove = async ({ origin, value }) => {
    return this.#setAttributes({ origin, attributes: { autoApprove: value } })
  }

  setFavorite = async ({ origin, value, assetNames = [] }) => {
    return this.#setAttributes({ origin, attributes: { favorite: value, assetNames } })
  }

  connect = async ({ id, origin }) => {
    const value = await this.#getOrigin({ origin })

    if (!value) return

    const activeConnections = value.activeConnections || []
    const newConnection = { id, createdAt: Date.now() }
    const newConnections = uniqBy([...activeConnections, newConnection], 'id')

    await this.#setAttributes({ origin, attributes: { activeConnections: newConnections } })
  }

  disconnect = async ({ id, origin }) => {
    const value = await this.#getOrigin({ origin })

    if (!value) return

    const activeConnections = value.activeConnections || []
    const newConnections = activeConnections.filter((connection) => connection.id !== id)

    await this.#setAttributes({ origin, attributes: { activeConnections: newConnections } })
  }

  updateConnection = async ({ origin, icon, connectedAssetName }) => {
    const value = await this.#getOrigin({ origin })

    if (!value) return

    const attributes = {}

    if (icon) {
      attributes.icon = icon
    }

    if (connectedAssetName) {
      attributes.connectedAssetName = connectedAssetName
    }

    await this.#setAttributes({ origin, attributes })
  }

  clearConnections = async () => {
    const data = await this.#getData()
    const newData = data.map((origin) => ({ ...origin, activeConnections: [] }))
    await this.#setData(newData)
  }
}

const createConnectedOrigins = (args) => new ConnectedOrigins({ ...args })

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'connectedOrigins',
  type: 'module',
  factory: createConnectedOrigins,
  dependencies: ['connectedOriginsAtom'],
  public: true,
}
