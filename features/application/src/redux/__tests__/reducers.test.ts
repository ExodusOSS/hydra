import eventReducers from '../reducers.js'
import type { State } from '../types.js'

const initialState: State = {
  isLoading: true,
  isLocked: true,
  isBackedUp: true,
  walletExists: true,
  hasPassphraseSet: true,
  isRestoring: false,
  lockHistory: [],
  autoLockTimer: null,
  walletCreatedAt: null,
}

const stalePayload = {
  isLocked: true,
  walletExists: true,
  hasPassphraseSet: true,
  isRestoring: true,
}

describe('application reducers', () => {
  // load/create only flip isLoading; every other field is driven by its own atom/event so a
  // stale Hook.Load (snapshot read before a concurrent create/unlock) can never clobber it.
  describe.each(['load', 'create'] as const)('%s only sets isLoading', (event) => {
    const reducer = eventReducers[event] as (s: State, p?: typeof stalePayload) => State

    it('sets isLoading false', () => {
      expect(reducer({ ...initialState, isLoading: true }).isLoading).toBe(false)
    })

    it('does not mutate isLocked', () => {
      const state: State = { ...initialState, isLocked: false }
      expect(reducer(state, { ...stalePayload, isLocked: true }).isLocked).toBe(false)
    })

    it('does not mutate walletExists', () => {
      const state: State = { ...initialState, walletExists: true }
      expect(reducer(state, { ...stalePayload, walletExists: false }).walletExists).toBe(true)
    })

    it('does not mutate hasPassphraseSet', () => {
      const state: State = { ...initialState, hasPassphraseSet: true }
      expect(reducer(state, { ...stalePayload, hasPassphraseSet: false }).hasPassphraseSet).toBe(
        true
      )
    })

    it('does not mutate isRestoring', () => {
      const state: State = { ...initialState, isRestoring: false }
      expect(reducer(state, { ...stalePayload, isRestoring: true }).isRestoring).toBe(false)
    })
  })

  describe('locked reducer (authoritative for isLocked)', () => {
    it('sets isLocked to the payload value', () => {
      expect(eventReducers.locked({ ...initialState, isLocked: false }, true).isLocked).toBe(true)
      expect(eventReducers.locked({ ...initialState, isLocked: true }, false).isLocked).toBe(false)
    })

    it('is not reverted by a later stale load', () => {
      let state: State = eventReducers.locked(initialState, false)
      state = eventReducers.load(state)
      expect(state.isLocked).toBe(false)
    })
  })

  describe('walletExists reducer (authoritative for walletExists)', () => {
    it('sets walletExists to the payload value', () => {
      expect(
        eventReducers.walletExists({ ...initialState, walletExists: false }, true).walletExists
      ).toBe(true)
      expect(
        eventReducers.walletExists({ ...initialState, walletExists: true }, false).walletExists
      ).toBe(false)
    })

    it('is not reverted by a later stale load', () => {
      let state: State = eventReducers.walletExists({ ...initialState, walletExists: false }, true)
      state = eventReducers.load(state)
      expect(state.walletExists).toBe(true)
    })
  })

  describe('hasPassphraseSet reducer (authoritative for hasPassphraseSet)', () => {
    it('sets hasPassphraseSet to the payload value', () => {
      expect(
        eventReducers.hasPassphraseSet({ ...initialState, hasPassphraseSet: false }, true)
          .hasPassphraseSet
      ).toBe(true)
      expect(
        eventReducers.hasPassphraseSet({ ...initialState, hasPassphraseSet: true }, false)
          .hasPassphraseSet
      ).toBe(false)
    })

    it('is not reverted by a later stale load', () => {
      let state: State = eventReducers.hasPassphraseSet(
        { ...initialState, hasPassphraseSet: false },
        true
      )
      state = eventReducers.load(state)
      expect(state.hasPassphraseSet).toBe(true)
    })
  })

  describe('restore reducer (authoritative for isRestoring)', () => {
    it('sets isRestoring from the restoreAtom event', () => {
      expect(eventReducers.restore(initialState, true).isRestoring).toBe(true)
      expect(eventReducers.restore({ ...initialState, isRestoring: true }, false).isRestoring).toBe(
        false
      )
    })

    it('is not reverted by a later stale load', () => {
      let state: State = eventReducers.restore(initialState, true)
      state = eventReducers.load(state)
      expect(state.isRestoring).toBe(true)
    })
  })

  describe('lock / unlock reducers', () => {
    it('lock sets isLocked=true', () => {
      expect(eventReducers.lock({ ...initialState, isLocked: false }).isLocked).toBe(true)
    })

    it('unlock sets isLocked=false', () => {
      expect(eventReducers.unlock({ ...initialState, isLocked: true }).isLocked).toBe(false)
    })
  })
})
