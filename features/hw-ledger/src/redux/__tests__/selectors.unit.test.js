import { setup } from './utils'

describe('selectors.hardwareWalletLedger.bluetoothStatus', () => {
  it('should retrieve state', () => {
    const { store, selectors, emitBluetoothStatus } = setup()

    expect(selectors.hardwareWalletLedger.bluetoothStatus(store.getState())).toEqual({
      type: 'Unknown',
      available: false,
    })
    emitBluetoothStatus({
      type: 'PoweredOn',
      available: true,
    })
    expect(selectors.hardwareWalletLedger.bluetoothStatus(store.getState())).toEqual({
      type: 'PoweredOn',
      available: true,
    })
  })
})

describe('selectors.hardwareWalletLedger.bluetoothScanning', () => {
  it('should retrieve state', () => {
    const { store, selectors, emitBluetoothScanning } = setup()

    expect(selectors.hardwareWalletLedger.bluetoothScanning(store.getState())).toEqual(false)
    emitBluetoothScanning(true)
    expect(selectors.hardwareWalletLedger.bluetoothScanning(store.getState())).toEqual(true)
  })
})
