import { getMessage } from '../getMessage.js'

describe('getMessage', () => {
  it('returns empty string when personalNote is null', () => {
    const result = getMessage({ tx: { to: '0x123' }, personalNote: null })
    expect(result).toBe('')
  })

  it('returns empty string when personalNote is undefined', () => {
    const result = getMessage({ tx: { to: '0x123' }, personalNote: undefined })
    expect(result).toBe('')
  })

  it('returns general message when no sends exist', () => {
    const personalNote = { message: 'General note' }
    const result = getMessage({ tx: { to: '0x123' }, personalNote })
    expect(result).toBe('General note')
  })

  it('returns empty string when personalNote has no message or sends', () => {
    const result = getMessage({ tx: { to: '0x123' }, personalNote: {} })
    expect(result).toBe('')
  })

  it('returns message for exact address match', () => {
    const personalNote = {
      sends: {
        '0x123': { message: 'Payment to Alice' },
      },
    }
    const result = getMessage({ tx: { to: '0x123' }, personalNote })
    expect(result).toBe('Payment to Alice')
  })

  it('returns message for case-insensitive address match', () => {
    const personalNote = {
      sends: {
        '0x123ABC': { message: 'Payment to Bob' },
      },
    }
    const result = getMessage({ tx: { to: '0x123abc' }, personalNote })
    expect(result).toBe('Payment to Bob')
  })

  it('returns first available message when tx.to is undefined (UTXO)', () => {
    const personalNote = {
      sends: {
        address1: { message: 'First message' },
        address2: { message: 'Second message' },
      },
    }
    const result = getMessage({ tx: {}, personalNote })
    expect(result).toBe('First message')
  })

  it('skips sends without message and returns general message', () => {
    const personalNote = {
      message: 'Fallback message',
      sends: {
        '0x123': {
          /* no message */
        },
      },
    }
    const result = getMessage({ tx: { to: '0x123' }, personalNote })
    expect(result).toBe('Fallback message')
  })

  it('prioritizes sends message over general message', () => {
    const personalNote = {
      message: 'General message',
      sends: {
        '0x123': { message: 'Specific message' },
      },
    }
    const result = getMessage({ tx: { to: '0x123' }, personalNote })
    expect(result).toBe('Specific message')
  })

  it('prioritizes top-level message over stale sends when tx.to is undefined', () => {
    const personalNote = {
      message: 'Edited note',
      sends: {
        'old-invoice': { message: 'Exodus' },
      },
    }
    const result = getMessage({ tx: { received: true }, personalNote })
    expect(result).toBe('Edited note')
  })

  it('returns empty string when tx.to is set but matches no sends key', () => {
    const personalNote = {
      sends: {
        '0xother': { message: "Other recipient's note" },
      },
    }
    const result = getMessage({ tx: { to: '0xNoMatch' }, personalNote })
    expect(result).toBe('')
  })

  it('falls back to sends when top-level message is an empty string and tx.to is undefined', () => {
    const personalNote = {
      message: '',
      sends: {
        '0x123': { message: 'Pay Alice' },
      },
    }
    const result = getMessage({ tx: {}, personalNote })
    expect(result).toBe('Pay Alice')
  })

  it('matches a sends address case-insensitively when tx.to is upper-cased', () => {
    const personalNote = {
      sends: {
        '0x123abc': { message: 'Payment to Carol' },
      },
    }
    const result = getMessage({ tx: { to: '0x123ABC' }, personalNote })
    expect(result).toBe('Payment to Carol')
  })
})
