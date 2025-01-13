import { mapValues } from '@exodus/basic-utils'

const defaultReducer = (state, { value, changes }) =>
  value
    ? mapValues(value, (txSetsByAsset) => ({
        error: null,
        loaded: true,
        data: txSetsByAsset,
      }))
    : {
        ...state,
        ...mapValues(changes, (txSetsByAsset, walletAccount) => ({
          ...state[walletAccount],
          error: null,
          loaded: true,
          data: {
            ...state[walletAccount]?.data,
            ...txSetsByAsset,
          },
        })),
      }

export default defaultReducer
