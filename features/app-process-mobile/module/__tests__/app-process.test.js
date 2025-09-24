import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import { createNoopLogger } from '@exodus/logger'
import { AppState } from 'react-native'

AppState.currentState = 'background' // start from background, this was enforced in mock

const { default: appProcessDefinition } = await import('../app-process.js')
const { factory: createAppProcess } = appProcessDefinition

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
        lockExtensionDuration: 1000,
        canRequestLockTimerExtension: true,
      },
    })
  }

  afterEach(() => {
    if (appProcess) {
      appProcess.stop()
    }
  })

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

  test('extends lock by extension duration', async () => {
    setup({ historyLimit: 2 })
    await appProcess.load()

    await appProcess.requestLockTimerExtension()

    const { lockActivatesAt } = await appProcessAtom.get()
    expect(lockActivatesAt).toBeDefined()
  })

  test('does not extend lock if existing lock is not expired', async () => {
    setup({ historyLimit: 2 })
    await appProcess.load()

    await appProcess.requestLockTimerExtension()
    const { lockActivatesAt } = await appProcessAtom.get()

    await appProcess.requestLockTimerExtension()
    const { lockActivatesAt: lockActivatesAt2 } = await appProcessAtom.get()

    expect(lockActivatesAt).toBe(lockActivatesAt2)
  })

  test('extends lock if existing lock is expired', async () => {
    jest.useFakeTimers()

    setup({ historyLimit: 2 })
    await appProcess.load()

    await appProcess.requestLockTimerExtension()
    const { lockActivatesAt } = await appProcessAtom.get()

    jest.advanceTimersByTime(2000)

    await appProcess.requestLockTimerExtension()
    const { lockActivatesAt: lockActivatesAt2 } = await appProcessAtom.get()

    expect(lockActivatesAt).not.toBe(lockActivatesAt2)
  })

  test('resets lock extension on app state change', async () => {
    jest.useFakeTimers()

    setup({ historyLimit: 2 })
    await appProcess.load()
    await appProcess.requestLockTimerExtension()

    jest.advanceTimersByTime(2000)

    await emitAppState('active')

    const { lockActivatesAt } = await appProcessAtom.get()
    expect(lockActivatesAt).toEqual(null)
  })
})
