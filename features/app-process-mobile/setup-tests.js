globalThis.__DEV__ = true

const { jest } = globalThis

jest.mock('@exodus/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getConnectionInfo: jest.fn().mockResolvedValue({ type: 'none', isConnected: false }),
    isConnected: {
      fetch: jest.fn().mockResolvedValue(false),
    },
  },
}))

jest.mock('react-native', () => {
  const { EventEmitter } = jest.requireActual('events')

  const AppState = {
    currentState: null,
    _emitter: new EventEmitter(),
    addEventListener(event, handler) {
      return AppState._emitter.on(event, handler)
    },
    removeEventListener(event, handler) {
      return AppState._emitter.off(event, handler)
    },
    emit(event, mode) {
      AppState.currentState = mode
      return AppState._emitter.emit(event, mode)
    },
  }

  return {
    __esModule: true,
    Platform: { OS: 'ios' },
    AppState,
    DeviceEventEmitter: null,
  }
})
