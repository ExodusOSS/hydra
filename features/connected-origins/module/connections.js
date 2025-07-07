import lodash from 'lodash'
import { pick } from '@exodus/basic-utils'

const { uniqBy, xor } = lodash

class ConnectedOrigins {
  #connectedOriginsAtom
  #connectedAccountsAtom
  #enabledWalletAccountsAtom
  #activeWalletAccountAtom
  #addressProvider

  constructor({
    activeWalletAccountAtom,
    connectedOriginsAtom,
    connectedAccountsAtom,
    enabledWalletAccountsAtom,
    addressProvider,
  }) {
    this.#activeWalletAccountAtom = activeWalletAccountAtom
    this.#connectedOriginsAtom = connectedOriginsAtom
    this.#connectedAccountsAtom = connectedAccountsAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#addressProvider = addressProvider
  }

  #getData = async () => {
    return this.#connectedOriginsAtom.get()
  }

  #getConnectedAssets = (connectedOrigins) => {
    return [
      ...new Set(
        connectedOrigins.flatMap((connection) =>
          [connection.connectedAssetName, ...(connection.assetNames ?? [])].filter(Boolean)
        )
      ),
    ]
  }

  #setData = async (data) => {
    const assetNames = this.#getConnectedAssets(data)
    const accounts = await this.#getAccounts(assetNames)

    return Promise.all([
      this.#connectedOriginsAtom.set(data),
      this.#connectedAccountsAtom.set(accounts),
    ])
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
    await this.#connectedAccountsAtom.set(undefined)
  }

  #addNewItem = async ({
    origin,
    name,
    icon,
    connectedAssetName,
    assetNames,
    accounts,
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
      accounts,
      autoApprove: false,
      createdAt: Date.now(),
      activeConnections: [],
      walletAccount,
    }

    const data = await this.#getData()
    const newData = [...data, newOrigin]

    await this.#setData(newData)
  }

  #getAccounts = async (assetNames) => {
    const walletAccounts = Object.values(await this.#enabledWalletAccountsAtom.get())

    const entries = await Promise.all(
      walletAccounts.map(async (walletAccount) => [
        walletAccount.toString(),
        {
          addresses: await this.#getWalletAccountAddresses(walletAccount, assetNames),
        },
      ])
    )

    return Object.fromEntries(entries)
  }

  #getWalletAccountAddresses = async (walletAccount, assetNames) => {
    const connectedAccounts = await this.#connectedAccountsAtom.get()
    const entries = await Promise.all(
      assetNames.map(async (assetName) => {
        const existingAddress = connectedAccounts[walletAccount]?.addresses[assetName]
        if (existingAddress) {
          return [assetName, existingAddress]
        }

        const address = await this.#addressProvider.getDefaultAddress({ assetName, walletAccount })
        return [assetName, address.toString()]
      })
    )

    return Object.fromEntries(entries)
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

  /**
   * Returns the connected accounts for a given origin with the active wallet account sorted first. Can be used while
   * the wallet is locked
   */
  getConnectedAccounts = async ({ origin }) => {
    const isTrusted = await this.isTrusted({ origin })
    if (!isTrusted) return []

    const value = await this.#getOrigin({ origin })
    const assetNames = [value.connectedAssetName, ...(value.assetNames ?? [])].filter(
      (name, index, ary) => Boolean(name) && ary.indexOf(name) === index
    )

    const activeWalletAccount = await this.#activeWalletAccountAtom.get()
    const accounts = await this.#connectedAccountsAtom.get()

    const connectedAccounts = []
    for (const name of Object.keys(accounts)) {
      if (name === activeWalletAccount) continue
      connectedAccounts.push({ name, addresses: pick(accounts[name].addresses, assetNames) })
    }

    connectedAccounts.unshift({
      name: activeWalletAccount,
      addresses: pick(accounts[activeWalletAccount].addresses, assetNames),
    })

    return connectedAccounts
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

  updateConnectedAccounts = async () => {
    const walletAccounts = await this.#enabledWalletAccountsAtom.get()
    const connectedAccounts = await this.#connectedAccountsAtom.get()

    const difference = xor(Object.keys(walletAccounts), Object.keys(connectedAccounts))
    if (difference.length === 0) {
      // up-to-date
      return
    }

    const connectedOrigins = await this.#connectedOriginsAtom.get()
    const assetNames = this.#getConnectedAssets(connectedOrigins)
    const updatedAccounts = await this.#getAccounts(assetNames)

    await this.#connectedAccountsAtom.set(updatedAccounts)
  }
}

const createConnectedOrigins = (args) => new ConnectedOrigins({ ...args })

const connectedOriginsDefinition = {
  id: 'connectedOrigins',
  type: 'module',
  factory: createConnectedOrigins,
  dependencies: [
    'connectedOriginsAtom',
    'connectedAccountsAtom',
    'enabledWalletAccountsAtom',
    'addressProvider',
    'activeWalletAccountAtom',
  ],
  public: true,
}

export default connectedOriginsDefinition
