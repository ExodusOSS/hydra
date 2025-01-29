import type { RatesByCurrency } from './types'

type State = {
  loaded: boolean
  error: string | null
  data: RatesByCurrency
}

declare const initialState: State

export default initialState
