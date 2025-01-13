import { diffCaches, getCachePath, getUnsyncedAddressesForPush } from '../utils.js'

const bigCache = {
  exodus_0: {
    path1: {
      address: 'address1',
      synced: true,
    },
    path2: {
      address: 'address2',
      synced: false,
    },
    path3: {
      address: 'address3',
      synced: true,
    },
  },
  exodus_1: {
    path1: {
      address: 'address1',
      synced: true,
    },
    path2: {
      address: 'address2',
      synced: false,
    },
    path3: {
      address: 'address3',
      synced: true,
    },
  },
}

const mismatchCache = {
  exodus_0: {
    path1: {
      address: 'address1',
      synced: false,
    },
    path4: {
      address: 'address4',
      synced: false,
    },
  },
  exodus_1: {
    path1: {
      address: 'address2',
      synced: false,
    },
  },
}

const smallCache = {
  exodus_0: {
    path1: {
      address: 'address1',
      synced: false,
    },
  },
}

describe('diffCaches', () => {
  it('finds different addresses', () => {
    expect(diffCaches(smallCache, bigCache)).toEqual({
      isDifferent: true,
      needsSync: true,
      diff: {
        exodus_0: {
          path1: {
            address: 'address1',
            synced: true,
          },
          path2: {
            address: 'address2',
            synced: false,
          },
          path3: {
            address: 'address3',
            synced: true,
          },
        },
        exodus_1: {
          path1: {
            address: 'address1',
            synced: true,
          },
          path2: {
            address: 'address2',
            synced: false,
          },
          path3: {
            address: 'address3',
            synced: true,
          },
        },
      },
    })

    expect(diffCaches(smallCache, mismatchCache)).toEqual({
      isDifferent: true,
      needsSync: true,
      diff: {
        exodus_0: {
          path4: {
            address: 'address4',
            synced: false,
          },
        },
        exodus_1: {
          path1: {
            address: 'address2',
            synced: false,
          },
        },
      },
    })

    expect(diffCaches(bigCache, mismatchCache)).toEqual({
      isDifferent: true,
      needsSync: true,
      diff: {
        exodus_0: {
          path4: {
            address: 'address4',
            synced: false,
          },
        },
        exodus_1: {
          path1: {
            address: 'address2',
            synced: false,
          },
        },
      },
    })
  })

  it('returns empty when no diff', () => {
    expect(diffCaches(bigCache, smallCache)).toEqual({
      isDifferent: false,
      needsSync: false,
      diff: {},
    })
  })

  it("doesn't throw on empty cache", () => {
    expect(diffCaches(bigCache, {})).toEqual({
      isDifferent: false,
      needsSync: false,
      diff: {},
    })

    expect(diffCaches({}, bigCache)).toEqual({
      isDifferent: true,
      needsSync: true,
      diff: bigCache,
    })
  })

  it('finds different synced flag', () => {
    expect(
      diffCaches(
        {
          exodus_0: {
            path1: {
              address: 'address1',
              synced: false,
            },
          },
        },
        {
          exodus_0: {
            path1: {
              address: 'address1',
              synced: true,
            },
          },
        }
      )
    ).toEqual({
      isDifferent: true,
      needsSync: true,
      diff: {
        exodus_0: {
          path1: {
            address: 'address1',
            synced: true,
          },
        },
      },
    })
  })

  it('returns needsSync when identical but needs sync', () => {
    expect(diffCaches(bigCache, bigCache)).toEqual({
      isDifferent: false,
      needsSync: true,
      diff: {},
    })
  })

  it('returns needsSync:false when identical and no sync needed', () => {
    const createCache = () => ({
      exodus_0: {
        path1: {
          address: 'address1',
          synced: true,
        },
      },
    })

    expect(diffCaches(createCache(), createCache())).toEqual({
      isDifferent: false,
      needsSync: false,
      diff: {},
    })
  })
})

describe('getUnsyncedAddressesForPush', () => {
  it('excludes synced and leaves only addresses', () => {
    expect(getUnsyncedAddressesForPush(bigCache)).toEqual({
      exodus_0: {
        path2: 'address2',
      },
      exodus_1: {
        path2: 'address2',
      },
    })
  })

  it("doesn't throw on empty cache", () => {
    expect(getUnsyncedAddressesForPush({})).toEqual({})
  })

  it("doesn't add addresses already synced in `currentCache`", () => {
    expect(
      getUnsyncedAddressesForPush(bigCache, {
        exodus_0: {
          path2: {
            synced: true,
            address: 'address2',
          },
        },
      })
    ).toEqual({
      exodus_1: {
        path2: 'address2',
      },
    })
  })

  it("adds addresses that don't match", () => {
    expect(
      getUnsyncedAddressesForPush(bigCache, {
        exodus_0: {
          path2: {
            synced: true,
            address: 'address1',
          },
        },
      })
    ).toEqual({
      exodus_0: {
        path2: 'address2',
      },
      exodus_1: {
        path2: 'address2',
      },
    })
  })
})

describe('getCachePath', () => {
  it('should return the correct path for legacy key assets', () => {
    const result = getCachePath({
      walletAccountName: 'exodus1',
      baseAssetName: 'bitcoin',
      derivationPath: 'm/44',
    })
    expect(result).toEqual(['exodus1', 'm/44'])
  })

  it('should return the correct path for non-legacy key assets', () => {
    const result = getCachePath({
      walletAccountName: 'exodus1',
      baseAssetName: 'someNewAsset',
      derivationPath: 'm/44',
    })
    expect(result).toEqual(['exodus1', 'someNewAsset/m/44'])
  })

  it('should throw an error if walletAccountName is not a string', () => {
    expect(() => {
      getCachePath({ walletAccountName: 123, baseAssetName: 'bitcoin', derivationPath: 'm/44' })
    }).toThrow('expected string "walletAccountName"')
  })

  it('should throw an error if baseAssetName is not a string', () => {
    expect(() => {
      getCachePath({ walletAccountName: 'exodus1', baseAssetName: 123, derivationPath: 'm/44' })
    }).toThrow('expected string "baseAssetName"')
  })

  it('should throw an error if derivationPath is not a string', () => {
    expect(() => {
      getCachePath({ walletAccountName: 'exodus1', baseAssetName: 'bitcoin', derivationPath: 123 })
    }).toThrow('expected string "derivationPath"')
  })
})
