const selectorFactory =
  (
    createAssetSourceBaseActivity,
    createWithFiatActivity,
    createWithNftsActivity,
    createWithConnectionsActivity
  ) =>
  // call this once on client-side
  (options = Object.create(null)) => {
    let createFullSelector = createAssetSourceBaseActivity
    createFullSelector = createWithNftsActivity({
      createActivitySelector: createFullSelector,
      nftsNetworkNameToAssetName:
        (Object.hasOwn(options, 'nftsNetworkNameToAssetName') &&
          options.nftsNetworkNameToAssetName) ||
        Object.create(null),
    })
    createFullSelector = createWithFiatActivity({ createActivitySelector: createFullSelector })
    createFullSelector = createWithConnectionsActivity({
      createActivitySelector: createFullSelector,
    })

    return createFullSelector
  }

const createFullActivitySelectorDefinition = {
  id: 'createFullActivity',
  selectorFactory,
  dependencies: [
    { selector: 'createAssetSourceBaseActivity' },
    { selector: 'createWithFiatActivity' },
    { selector: 'createWithNftsActivity' },
    { selector: 'createWithConnectionsActivity' },
  ],
}

export default createFullActivitySelectorDefinition
