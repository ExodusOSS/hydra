import { AppState } from 'react-native'

const startTime = Date.now()

const initialAppState = AppState.currentState || 'active'

export const APP_PROCESS_INITIAL_STATE = {
  mode: initialAppState,
  networkType: 'unknown',
  timeLastBackgrounded: initialAppState === 'background' ? startTime : 0,
  timeInBackground: 0,
  startTime,
}
