import NetInfo from '@exodus/netinfo'
import lodash from 'lodash'
import { AppState, DeviceEventEmitter, Platform } from 'react-native'
import { APP_PROCESS_INITIAL_STATE } from '../constants.js'

import makeConcurrent from 'make-concurrent'

const { isEqual } = lodash

const isAndroid = Platform.OS === 'android'

const INTERVAL_NETWORK_POLLING_INITIAL = 1000
const INTERVAL_NETWORK_POLLING_MAX = 10_000
const INTERVAL_NETWORK_POLLING_INCREMENT = 1000

export class AppProcess {
  #appProcessAtom
  #appStateHistoryAtom
  #logger
  #networkState
  #networkPollInterval = null
  #networkPollIntervalMs = INTERVAL_NETWORK_POLLING_INITIAL
  #lastNetworkState = null
  #unsubscribes = []
  #returningFromBackgroundEvent
  #historyLimit
  #lockExtensionDuration
  #canRequestLockTimerExtension
  #isInForeground = false

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

    const wasActive = this.#isInForeground
    this.#isInForeground = newMode === 'active'

    if (newMode === 'active' && !wasActive) {
      this.#networkPollIntervalMs = INTERVAL_NETWORK_POLLING_INITIAL

      try {
        const isConnected = await NetInfo.isConnected?.fetch?.()
        const isOffline = !isConnected

        if (isOffline) {
          this.#startNetworkPolling()
        }
      } catch (error) {
        this.#logger.error('Failed to check network on app active:', error)
      }
    } else if ((newMode === 'background' || newMode === 'inactive') && wasActive) {
      this.#stopNetworkPolling()
    }

    await this.#update({
      mode: newMode,
      timeInBackground: 0,
      ...(this.#lockExtensionExpired(lockActivatesAt) ? { lockActivatesAt: null } : {}),
    })
  })

  #handleConnectionChange = async (state) => {
    const isConnected = await NetInfo.isConnected?.fetch?.()
    const isOffline = !isConnected
    const wasOffline = !this.#lastNetworkState?.isConnected

    // Normalize Android network type for consistency across platforms
    let networkType = state.type
    if (isAndroid) {
      if (state.type === 'unknown') {
        if (isOffline) {
          networkType = 'none' // Android reports 'unknown' during online transition, default to none
        }
      } else if (state.type === 'none' && !isOffline) {
        networkType = 'unknown' // Android reports 'none' during online transition, default to unknown
      }
    }

    if (isOffline !== wasOffline || !this.#lastNetworkState) {
      this.#networkState = { ...state, isConnected, type: networkType }
      this.#lastNetworkState = { ...state, isConnected, type: networkType }

      await this.#update({
        networkType,
        isOffline,
        timeLastNetworkChange: Date.now(),
      })
    }

    if (isOffline && this.#isInForeground) {
      this.#startNetworkPolling()
    } else {
      this.#stopNetworkPolling()
    }
  }

  #startNetworkPolling = () => {
    if (this.#networkPollInterval) return

    this.#networkPollInterval = setInterval(async () => {
      try {
        if (!this.#isInForeground) {
          this.#stopNetworkPolling()
          return
        }

        const isConnected = await NetInfo.isConnected?.fetch?.()
        const isOffline = !isConnected
        const wasOffline = !this.#lastNetworkState?.isConnected

        if (isOffline !== wasOffline) {
          const state = await NetInfo.getConnectionInfo?.()
          await this.#handleConnectionChange(state)
        } else if (isOffline) {
          this.#increasePollingInterval()
        }
      } catch (error) {
        this.#logger.error('Network polling failed:', error)
      }
    }, this.#networkPollIntervalMs)
  }

  #increasePollingInterval = () => {
    if (this.#networkPollIntervalMs < INTERVAL_NETWORK_POLLING_MAX) {
      this.#networkPollIntervalMs = Math.min(
        this.#networkPollIntervalMs + INTERVAL_NETWORK_POLLING_INCREMENT,
        INTERVAL_NETWORK_POLLING_MAX
      )

      this.#stopNetworkPolling()
      this.#startNetworkPolling()
    }
  }

  #stopNetworkPolling = () => {
    if (this.#networkPollInterval) {
      clearInterval(this.#networkPollInterval)
      this.#networkPollInterval = null
    }
  }

  #handleBackFromBackground = async ({ timeInBackground }) => {
    this.#logger.debug(this.#returningFromBackgroundEvent, 'timeInBackground:', timeInBackground)

    this.#isInForeground = true

    this.#networkPollIntervalMs = INTERVAL_NETWORK_POLLING_INITIAL

    try {
      const isConnected = await NetInfo.isConnected?.fetch?.()
      const isOffline = !isConnected

      if (isOffline) {
        this.#startNetworkPolling()
      }
    } catch (error) {
      this.#logger.error('Failed to check network on back from background:', error)
    }

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

    const initialState = AppState.currentState
    this.#isInForeground = initialState === 'active'

    await this.#update({ mode: initialState })
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
    this.#stopNetworkPolling()
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
