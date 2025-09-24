import { bluetoothScanningAtomDefinition, bluetoothStatusAtomDefinition } from '../../atoms'
import { APDU_PORT } from '../constants'
import definition, { LedgerDiscovery } from '../discovery'
import { UnknownTransportError } from '../errors'

const mockListTransport = jest.fn()
const mockListenTransport = jest.fn()
const mockOpenTransport = jest.fn()
const mockTransport = {
  list: mockListTransport,
  listen: mockListenTransport,
  open: mockOpenTransport,
}

const config = {
  bluetoothScannerTimeout: 100,
}

const logger = console
const bluetoothStatusAtom = bluetoothStatusAtomDefinition.factory()
const bluetoothScanningAtom = bluetoothScanningAtomDefinition.factory()

describe('LedgerDiscovery', () => {
  describe('.constructor()', () => {
    it('should work', async () => {
      const transportsFactories = { usb: mockTransport }
      expect(
        () => new LedgerDiscovery({ logger, config, transportsFactories, bluetoothScanningAtom })
      ).not.toThrow()
    })

    it('should work through definition', async () => {
      const transportsFactories = { usb: mockTransport }
      expect(() =>
        definition.factory({ logger, config, transportsFactories, bluetoothScanningAtom })
      ).not.toThrow()
    })

    it('should fail when no valid transports', async () => {
      const transports = [{}, { invalid: {} }, { usb: undefined }]
      transports.forEach((transportsFactories) => {
        expect(
          () => new LedgerDiscovery({ logger, config, transportsFactories, bluetoothScanningAtom })
        ).toThrow(new UnknownTransportError())
      })
    })
  })

  describe('.list()', () => {
    let discovery = null

    beforeEach(() => {
      mockListTransport.mockReset()
      mockOpenTransport.mockReset()
    })

    describe('usb', () => {
      beforeEach(() => {
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { usb: mockTransport },
          bluetoothScanningAtom,
        })
      })

      it('should discover', async () => {
        const hidDevice = {
          productId: 'testing',
        }
        mockListTransport.mockResolvedValueOnce([hidDevice])

        const descriptors = await discovery.list()
        expect(Array.isArray(descriptors)).toBeTruthy()
        const descriptor = descriptors[0]
        expect(descriptor).toMatchObject({ manufacturer: 'ledger', transport: 'usb' })
        expect(mockListTransport).toHaveBeenCalled()

        const device = await descriptor.get()
        expect(device).toBeDefined()
        expect(mockOpenTransport).not.toHaveBeenCalledWith(hidDevice)
      })
    })

    describe('bluetooth', () => {
      beforeEach(() => {
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { bluetooth: mockTransport },
          bluetoothScanningAtom,
        })
      })

      it('should not discover without scan', async () => {
        const descriptors = await discovery.list()
        expect(Array.isArray(descriptors)).toBeTruthy()
        expect(descriptors.length).toBe(0)
      })
    })

    describe('tcp', () => {
      beforeEach(() => {
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { tcp: mockTransport },
        })
      })

      it('should discover', async () => {
        const tcpInfo = {
          apduPort: APDU_PORT,
        }
        mockListTransport.mockResolvedValueOnce([tcpInfo])

        const descriptors = await discovery.list()
        expect(Array.isArray(descriptors)).toBeTruthy()
        const descriptor = descriptors[0]
        expect(descriptor).toMatchObject({ manufacturer: 'ledger', transport: 'tcp' })

        const device = await descriptor.get()
        expect(device).toBeDefined()
        expect(mockOpenTransport).not.toHaveBeenCalledWith(tcpInfo)
      })
    })
  })

  describe('.scan()', () => {
    let discovery = null

    beforeEach(() => {
      mockListTransport.mockReset()
      mockOpenTransport.mockReset()
    })

    describe('bluetooth', () => {
      beforeEach(() => {
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { bluetooth: mockTransport },
          bluetoothScanningAtom,
        })
      })

      it('should add discoverable devices', async () => {
        const bluetoothDevice = {
          id: 'DE:F1:C1:76:F1:7D',
          serviceUUIDs: ['13d63400-2c97-6004-0000-4c6564676572'],
        }
        mockListenTransport.mockImplementationOnce((observer) => {
          expect(typeof observer.next).toBe('function')
          expect(typeof observer.error).toBe('function')
          expect(typeof observer.complete).toBe('function')
          observer.next({
            type: 'add',
            descriptor: bluetoothDevice,
          })
        })

        await discovery.scan()
        expect(mockListenTransport).toHaveBeenCalled()
        const descriptors = await discovery.list()
        expect(Array.isArray(descriptors)).toBeTruthy()
        const descriptor = descriptors[0]
        expect(descriptor).toMatchObject({ manufacturer: 'ledger', transport: 'bluetooth' })

        const device = await descriptor.get()
        expect(device).toBeDefined()
        expect(mockOpenTransport).not.toHaveBeenCalledWith(bluetoothDevice)
      }, 15_000)

      it('should dedupe discoverable devices', async () => {
        const bluetoothDevice = {
          id: 'DE:F1:C1:76:F1:7D',
          serviceUUIDs: ['13d63400-2c97-6004-0000-4c6564676572'],
        }
        mockListenTransport.mockImplementationOnce((observer) => {
          observer.next({
            type: 'add',
            descriptor: bluetoothDevice,
          })
          observer.next({
            type: 'add',
            descriptor: bluetoothDevice,
          })
        })

        await discovery.scan()
        expect(mockListenTransport).toHaveBeenCalled()
        const descriptors = await discovery.list()
        expect(Array.isArray(descriptors)).toBeTruthy()
        expect(descriptors.length).toBe(1)
        expect(descriptors[0]).toEqual(
          expect.objectContaining({
            name: 'Ledger Stax',
            model: 'stax',
          })
        )
      })

      it('should stop scanning automatically', async () => {
        const mockStopScanning = jest.fn()
        mockListenTransport.mockImplementationOnce(() => {
          return { unsubscribe: mockStopScanning }
        })

        await discovery.scan()
        expect(mockStopScanning).toHaveBeenCalled()
      })

      it('should stop scanning on error (if successfully created)', async () => {
        let resolve = null
        const done = new Promise((_resolve) => {
          resolve = _resolve
        })

        const mockStopScanning = jest.fn()
        mockListenTransport.mockImplementationOnce((observer) => {
          // Schedule this error in the future to simulate async error because
          // if we immediately error then the subscriber #scannerBluetooth by .listen() will never
          // be created and we'll never be able to stop it.
          setTimeout(() => {
            observer.error(new Error('clean me up pls'))
            resolve()
          }, 1000)
          return { unsubscribe: mockStopScanning }
        })

        await discovery.scan().catch(() => {})
        await done
        expect(mockStopScanning).toHaveBeenCalled()
      })
    })
  })

  describe('bluetooth updates', () => {
    let discovery
    beforeEach(async () => {
      await bluetoothScanningAtom.reset()
      await bluetoothStatusAtom.reset()
    })

    describe('with observeState', () => {
      const bluetooth = {
        ...mockTransport,
        observeState: jest.fn(),
      }

      beforeEach(() => {
        bluetooth.observeState.mockReset()
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { bluetooth },
          bluetoothScanningAtom,
          bluetoothStatusAtom,
        })
      })

      it('should poll for update onLoad', () => {
        discovery.start()
        expect(bluetooth.observeState).toHaveBeenCalled()
      })

      it('should not poll twice', async () => {
        bluetooth.observeState.mockResolvedValueOnce({ unsubscribe: jest.fn() })
        await discovery.start()
        await discovery.start()
        expect(bluetooth.observeState).toHaveBeenCalledTimes(1)
      })

      it('should clean up properly', async () => {
        const unsubscribe = jest.fn()
        bluetooth.observeState.mockImplementationOnce(() => ({
          unsubscribe,
        }))
        discovery.start()
        discovery.stop()
        expect(unsubscribe).toHaveBeenCalled()
      })

      it('should update bluetoothStatusAtom', async () => {
        let observer
        bluetooth.observeState.mockImplementationOnce((_observer) => (observer = _observer))
        discovery.start()
        observer.next({
          type: 'PoweredOn',
          available: true,
        })
        expect(await bluetoothStatusAtom.get()).toEqual({
          type: 'PoweredOn',
          available: true,
        })
        observer.next({
          type: 'Unauthorized',
          available: false,
        })
        expect(await bluetoothStatusAtom.get()).toEqual({
          type: 'Unauthorized',
          available: false,
        })
      })
    })

    describe('with observeAvailability', () => {
      const bluetooth = {
        ...mockTransport,
        observeAvailability: jest.fn(),
      }

      beforeEach(() => {
        bluetooth.observeAvailability.mockReset()
        discovery = new LedgerDiscovery({
          logger,
          config,
          transportsFactories: { bluetooth },
          bluetoothScanningAtom,
          bluetoothStatusAtom,
        })
      })

      it('should poll for update onLoad', () => {
        discovery.start()
        expect(bluetooth.observeAvailability).toHaveBeenCalled()
      })

      it('should not poll twice', () => {
        bluetooth.observeAvailability.mockResolvedValueOnce({ unsubscribe: jest.fn() })
        discovery.start()
        discovery.start()
        expect(bluetooth.observeAvailability).toHaveBeenCalledTimes(1)
      })

      it('should clean up properly', async () => {
        const unsubscribe = jest.fn()
        bluetooth.observeAvailability.mockImplementationOnce(() => ({
          unsubscribe,
        }))
        discovery.start()
        discovery.stop()
        expect(unsubscribe).toHaveBeenCalled()
      })

      it('should update bluetoothStatusAtom', async () => {
        let observer
        bluetooth.observeAvailability.mockImplementationOnce((_observer) => (observer = _observer))
        discovery.start()
        observer.next(true)
        expect(await bluetoothStatusAtom.get()).toEqual({ available: true, type: 'Unknown' })
        observer.next(false)
        expect(await bluetoothStatusAtom.get()).toEqual({ available: false, type: 'Unknown' })
      })
    })
  })
})
