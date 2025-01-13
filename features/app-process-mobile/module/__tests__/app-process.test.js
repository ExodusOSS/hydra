import appProcessDefinition from '../app-process'
import { createNoopLogger } from '@exodus/logger'
import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import { AppState } from 'react-native'

const { factory: createAppProcess } = appProcessDefinition

jest.mock('@exodus/netinfo', () => ({
  default: {
    addEventListener: jest.fn(),
    getConnectionInfo: jest.fn().mockResolvedValue({ type: 'none' }),
  },
  __esModule: true,
}))

jest.mock('react-native', () => {
  const { EventEmitter } = jest.requireActual('events')

  const AppState = new EventEmitter()
  AppState.currentState = 'background'
  AppState.addEventListener = (event, handler) => {
    return AppState.on(event, handler)
  }

  const originalEmit = AppState.emit.bind(AppState)
  AppState.emit = (event, mode) => {
    AppState.currentState = mode
    return originalEmit(event, mode)
  }

  return {
    Platform: {
      OS: 'ios',
    },
    AppState,
  }
})

describe('AppProcess', () => {
  /** @type {import('../app-process').AppProcess} */
  let appProcess
  let appStateHistoryAtom
  let appProcessAtom

  const setup = ({ historyLimit = 25 } = {}) => {
    appStateHistoryAtom = createInMemoryAtom({ defaultValue: [] })
    appProcessAtom = createInMemoryAtom()
    appProcess = createAppProcess({
      logger: createNoopLogger(),
      appProcessAtom,
      appStateHistoryAtom,
      config: {
        historyLimit,
        returningFromBackgroundEvent: 'back-from-background',
      },
    })
  }

  const emitAppState = async (mode) => {
    AppState.emit('change', mode)
    await waitUntil({
      atom: appProcessAtom,
      predicate: (state) => state.mode === mode,
    })
  }

  test('writes changes to history atom', async () => {
    setup()
    await appProcess.load()

    await emitAppState('active')
    await emitAppState('background')
    await emitAppState('inactive')
    await emitAppState('background')
    await emitAppState('active')
    await emitAppState('end')

    await expect(appStateHistoryAtom.get()).resolves.toEqual([
      {
        from: 'background',
        to: 'active',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'active',
        to: 'background',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'background',
        to: 'inactive',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'inactive',
        to: 'background',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'background',
        to: 'active',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'active',
        to: 'end',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
    ])
  })

  test('only keeps up to configured amount in app state history atom', async () => {
    setup({ historyLimit: 2 })
    await appProcess.load()

    await emitAppState('active')
    await emitAppState('background')
    await emitAppState('inactive')
    await emitAppState('background')
    await emitAppState('active')
    await emitAppState('end')

    await expect(appStateHistoryAtom.get()).resolves.toEqual([
      {
        from: 'background',
        to: 'active',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
      {
        from: 'active',
        to: 'end',
        timeInBackground: expect.any(Number),
        timeLastBackgrounded: expect.any(Number),
        timestamp: expect.any(Date),
      },
    ])
  })
})
