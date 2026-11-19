const createWalletLifecyclePlugin = ({ wallet, walletExistsAtom, hasPassphraseSetAtom }) => {
  const onStart = async () => {
    const [walletExists, hasPassphraseSet] = await Promise.all([
      wallet.exists(),
      wallet.hasPassphraseSet(),
    ])

    await Promise.all([
      walletExistsAtom.set(walletExists),
      hasPassphraseSetAtom.set(hasPassphraseSet),
    ])
  }

  return { onStart }
}

const walletLifecyclePluginDefinition = {
  id: 'walletLifecyclePlugin',
  type: 'plugin',
  factory: createWalletLifecyclePlugin,
  dependencies: ['wallet', 'walletExistsAtom', 'hasPassphraseSetAtom'],
  public: true,
}

export default walletLifecyclePluginDefinition
