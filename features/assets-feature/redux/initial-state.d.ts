type State = {
  loaded: boolean
  error: string | null
  disabledPurposes: {
    [assetName: string]: number[]
  }
  multiAddressMode: {
    [assetName: string]: boolean
  }
}

declare const initialState: State

export default initialState
