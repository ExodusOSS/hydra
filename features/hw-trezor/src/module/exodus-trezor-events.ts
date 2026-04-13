import { TrezorEvents } from '@exodus/trezor-events'

interface SignEthereumMessageResult {
  signature: Buffer
  address: string
}

export class ExodusTrezorEvents extends TrezorEvents {
  declare signEthereumMessage: (
    rawKeyPath: string | number[],
    message: Buffer | string
  ) => Promise<SignEthereumMessageResult>

  declare signEthereumTypedData: (
    rawKeyPath: string | number[],
    typedData: {
      types: Record<string, { name: string; type: string }[]>
      primaryType: string
      domain: Record<string, unknown>
      message: Record<string, unknown>
    }
  ) => Promise<SignEthereumMessageResult>

  #passphraseMode: 'standard' | 'hidden' = 'standard'

  constructor(config: any) {
    super(config)
  }

  // trezor-events will call this during passphrase session establishment.
  // Returning a nullish value signals "enter on device" (PassphraseAck.on_device = true).
  async getPassphrase() {
    const mode = this.#passphraseMode
    // Standard wallet: supply an empty passphrase so the user isn't prompted.
    if (mode === 'standard') return ''
    // Hidden wallet: always force entry on the device (we never collect passphrases in-app).
    return null
  }

  setPassphraseMode(mode: 'standard' | 'hidden') {
    this.#passphraseMode = mode
  }

  getPassphraseMode() {
    return this.#passphraseMode
  }
}
