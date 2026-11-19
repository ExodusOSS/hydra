export type State = {
  loaded: boolean
  data: Record<string, unknown>
}

const initialState: State = {
  loaded: false,
  data: Object.create(null),
}

export default initialState
