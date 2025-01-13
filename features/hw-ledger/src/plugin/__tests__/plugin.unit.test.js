import { bluetoothScanningAtomDefinition, bluetoothStatusAtomDefinition } from '../../atoms'
import hardwareWalletLedgerPluginDefinition from '../index'

const logger = console
describe('createHardwareWalletLedgerPlugin', () => {
  it('should create a plugin', () => {
    expect(() =>
      hardwareWalletLedgerPluginDefinition.factory({
        logger,
        transportsFactories: {},
        bluetoothStatusAtom: bluetoothStatusAtomDefinition.factory(),
        bluetoothScanningAtom: bluetoothScanningAtomDefinition.factory(),
        port: {
          emit: jest.fn(),
        },
      })
    ).not.toThrow()
  })
})
