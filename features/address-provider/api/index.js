const createAddressProviderApi = ({
  addressProvider,
  lockedAtom,
  walletAccountsAtom,
  addressCacheAtom,
}) => {
  const getAddressFromResponse =
    (fn) =>
    async (...args) =>
      fn(...args).then((response) => response.address)

  const withWalletAccountInstance =
    (fn) =>
    async ({ walletAccount, ...rest }) => {
      if (await lockedAtom.get()) throw new Error('address-provider: wallet should be unlocked')
      const walletAccounts = await walletAccountsAtom.get()
      return fn({ ...rest, walletAccount: walletAccount && walletAccounts[walletAccount] })
    }

  const getAddress = withWalletAccountInstance(addressProvider.getAddress.bind(addressProvider))
  const isOwnAddress = withWalletAccountInstance(addressProvider.isOwnAddress.bind(addressProvider))

  const getSupportedPurposes = withWalletAccountInstance(
    addressProvider.getSupportedPurposes.bind(addressProvider)
  )

  const getDefaultAddress = withWalletAccountInstance(
    addressProvider.getDefaultAddress.bind(addressProvider)
  )

  const getReceiveAddress = getAddressFromResponse(
    withWalletAccountInstance(addressProvider.getReceiveAddress.bind(addressProvider))
  )

  const getReceiveAddressObject = withWalletAccountInstance(
    addressProvider.getReceiveAddress.bind(addressProvider)
  )

  const getUnusedAddress = withWalletAccountInstance(
    addressProvider.getUnusedAddress.bind(addressProvider)
  )

  return {
    addressProvider: {
      getAddress,
      getDefaultAddress,
      getReceiveAddress,
      getReceiveAddressObject,
      getSupportedPurposes,
      getDefaultPurpose: addressProvider.getDefaultPurpose,
      getUnusedAddress,
      isOwnAddress,
      awaitAddressCacheLoaded: async () => {
        await addressCacheAtom.get()
      },
    },
  }
}

const addressProviderApiDefinition = {
  id: 'addressProviderApi',
  type: 'api',
  factory: createAddressProviderApi,
  dependencies: ['addressProvider', 'lockedAtom', 'walletAccountsAtom', 'addressCacheAtom'],
}

export default addressProviderApiDefinition
