import NetInfo from '@exodus/netinfo'
import { isEqual } from 'lodash'
import { AppState, DeviceEventEmitter, Platform } from 'react-native'
import { APP_PROCESS_INITIAL_STATE } from '../constants'

import makeConcurrent from 'make-concurrent'

const isAndroid = Platform.OS === 'android'

export class AppProcess {
  #appProcessAtom
  #appStateHistoryAtom
  #logger
  #networkState
  #unsubscribes = []
  #returningFromBackgroundEvent
  #historyLimit
  #lockExtensionDuration
  #canRequestLockTimerExtension

  constructor({ appProcessAtom, appStateHistoryAtom, logger, config }) {
    this.#appProcessAtom = appProcessAtom
    this.#appStateHistoryAtom = appStateHistoryAtom
    this.#logger = logger
    this.#historyLimit = config.historyLimit
    this.#lockExtensionDuration = config.lockExtensionDuration
    this.#returningFromBackgroundEvent = config.returningFromBackgroundEvent
    this.#canRequestLockTimerExtension = config.canRequestLockTimerExtension
  }

  #recordHistory = async (current, newData) => {
    await this.#appStateHistoryAtom.set((prev) =>
      [
        ...prev,
        {
          from: current.mode,
          to: newData.mode,
          timestamp: new Date(),
          timeInBackground: newData.timeInBackground,
          timeLastBackgrounded: newData.timeLastBackgrounded,
        },
      ].slice(-this.#historyLimit)
    )
  }

  #update = async (newData) => {
    await this.#appProcessAtom.set(async (current = APP_PROCESS_INITIAL_STATE) => {
      const data = { ...current, ...setModeDerivedProperties({ current, newData }) }

      if (isEqual(data, current)) return current

      if (data.mode !== current.mode) {
        void this.#recordHistory(current, data)
      }

      return data
    })
  }

  #lockExtensionExpired = (lockActivatesAt) => lockActivatesAt && Date.now() > lockActivatesAt

  #handleAppStateChange = makeConcurrent(async (newMode) => {
    const { lockActivatesAt, mode } = await this.#appProcessAtom.get()

    this.#logger.debug({ newMode, currentMode: mode })
    if (newMode === mode) return

    if (isAndroid && mode === 'background' && newMode === 'active') {
      this.#logger.debug(
        `ignoring background -> active AppState event, waiting for custom "${this.#returningFromBackgroundEvent}" event`
      )

      return
    }

    await this.#update({
      mode: newMode,
      timeInBackground: 0,
      ...(this.#lockExtensionExpired(lockActivatesAt) ? { lockActivatesAt: null } : {}),
    })
  })

  #handleConnectionChange = async (state) => {
    this.#networkState = state
    await this.#update({ networkType: state.type })
  }

  #handleBackFromBackground = async ({ timeInBackground }) => {
    this.#logger.debug(this.#returningFromBackgroundEvent, 'timeInBackground:', timeInBackground)

    await this.#update({ mode: 'active', timeInBackground })
  }

  load = async () => {
    const subscription = AppState.addEventListener('change', this.#handleAppStateChange)

    NetInfo.addEventListener('connectionChange', this.#handleConnectionChange)

    NetInfo.getConnectionInfo().then((initialState) => {
      if (!this.#networkState) this.#handleConnectionChange(initialState)
    })

    this.#unsubscribes = [
      () => {
        if (subscription) {
          if (subscription.remove) {
            subscription.remove()
          } else {
            AppState.removeEventListener('change', this.#handleAppStateChange)
          }
        }
      },
      () => NetInfo.removeEventListener('connectionChange', this.#handleConnectionChange),
    ]

    if (isAndroid) {
      const deviceEventListener = DeviceEventEmitter.addListener(
        this.#returningFromBackgroundEvent,
        this.#handleBackFromBackground
      )
      this.#unsubscribes.push(() => deviceEventListener.remove())
    }

    await this.#update({ mode: AppState.currentState })
  }

  requestLockTimerExtension = async () => {
    const { lockActivatesAt } = await this.#appProcessAtom.get()

    if (
      this.#canRequestLockTimerExtension &&
      (!lockActivatesAt || this.#lockExtensionExpired(lockActivatesAt))
    ) {
      await this.#update({ lockActivatesAt: Date.now() + this.#lockExtensionDuration })
    }
  }

  stop = () => {
    this.#unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  awaitState = async (state) =>
    new Promise((resolve) => {
      if (AppState.currentState === state) return resolve()

      this.#logger.debug(`waiting for app state ${state}`)
      const handler = (newState) => {
        if (newState === state) {
          this.#logger.debug(`got app state: ${state}`)
          resolve()
          if (this.focusChangeListener) {
            if (this.focusChangeListener.remove) {
              this.focusChangeListener.remove()
              this.focusChangeListener = null
            } else {
              AppState.removeEventListener('change', handler)
            }
          }
        }
      }

      this.focusChangeListener = AppState.addEventListener('change', handler)
    })

  awaitForeground = () => this.awaitState('active')
}

const setModeDerivedProperties = ({ current, newData }) => {
  const { mode, timeInBackground } = newData

  if (mode === 'active') {
    return {
      ...newData,
      timeInBackground:
        timeInBackground || current.timeLastBackgrounded
          ? Date.now() - current.timeLastBackgrounded
          : 0,
      timeLastBackgrounded: 0,
    }
  }

  if (mode === 'background') {
    return {
      ...newData,
      timeLastBackgrounded: Date.now(),
      timeInBackground: 0,
    }
  }

  return newData
}

const createAppProcess = (deps) => new AppProcess(deps)

const appProcessDefinition = {
  id: 'appProcess',
  type: 'module',
  factory: createAppProcess,
  dependencies: ['appProcessAtom', 'logger', 'appStateHistoryAtom', 'config'],
  public: true,
}

export default appProcessDefinition
