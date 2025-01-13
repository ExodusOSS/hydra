export type Bytes = Readonly<Uint8Array>

/**
 * HardwareWalletManufacturer
 */

export type LedgerManufacturer = 'ledger'
export type TrezorManufacturer = 'trezor'
export type HardwareWalletManufacturer = LedgerManufacturer | TrezorManufacturer

/**
 * HardwareWalletDeviceModels
 */

export type LedgerModels = 'blue' | 'nanoS' | 'nanoSP' | 'nanoX' | 'stax' | 'europa'
export type TrezorModels = 't' | '1' | 'Safe 3' | 'Safe 5'
export type HardwareWalletDeviceModels = LedgerModels | TrezorModels | 'unknown'

/**
 * HardwareWalletSupportMatrix
 *
 * This is a map of supported hardware wallets, where the key is the manufacturer and
 * the value is an object with the supported models.
 * An object of this type MAY be exposed on asset.baseAsset.api.features.hardwareWallets?.supportMatrix
 * to indicate the supported hardware wallets and models for the asset.
 */
export type HardwareWalletSupportMatrix = Record<
  HardwareWalletManufacturer,
  HardwareWalletSupportEntry | undefined
>
export type HardwareWalletSupportEntry = {
  models: (LedgerModels | TrezorModels)[]
}

/**
 * HardwareWalletDiscovery
 */
export interface HardwareWalletDiscovery {
  scan: () => Promise<void>
  stopScan: (clearDevices?: boolean) => void
  list: () => Promise<HardwareWalletDescriptor[]>
}

/**
 * InternalDescriptor
 */
export type LedgerDescriptorTCP = { apduPort: number } // Emulator
export type LedgerDescriptorBLE = { localName: string; serviceUUIDs: [string] } // Bluetooth Low Energy
export type LedgerDescriptorWebUSB = USBDevice // WebUSB only (Node USB HID is different!)
export type InternalDescriptor = LedgerDescriptorTCP | LedgerDescriptorBLE | LedgerDescriptorWebUSB

/**
 * HardwareWalletDescriptor
 */
export interface HardwareWalletDescriptor {
  name: string
  manufacturer: HardwareWalletManufacturer
  model: HardwareWalletDeviceModels
  transport: TransportTypes
  get: () => Promise<HardwareWalletDevice>
  internalDescriptor: InternalDescriptor
}

export type TransportTypes = 'usb' | 'bluetooth' | 'tcp'

/**
 * HardwareWalletAssetHandler
 */
export interface HardwareWalletAssetHandler<IMessage = Message> {
  getAddress: (params: GetAddressParams) => Promise<string>
  getXPub: (params: GetXPubParams) => Promise<string>
  getPublicKey: (params: GetPublicKeyParams) => Promise<Bytes>
  signTransaction: (params: SignTransactionParams) => Promise<Signatures>
  signMessage: (params: SignMessageParams<IMessage>) => Promise<Bytes>
}

/**
 * Signatures
 */
export type Signatures = {
  publicKey?: Buffer
  inputIndex?: number
  signature: Buffer
  tapleafHash?: Buffer
}[]

/**
 * HardwareWalletDevice
 */
export interface HardwareWalletDevice<IMessage = Message>
  extends HardwareWalletAssetHandler<IMessage> {
  // The descriptor of the device
  get descriptor(): HardwareWalletDescriptor
  // All assets supported by our implementation for this device.
  listSupportedAssetNames: () => Promise<string[]>
  // All assets supported by our implementation AND installed on this device.
  listInstalledAssetNames: () => Promise<string[]>
  // All assets supported by our implementation, installed on this device AND opened on the device (ledger).
  listUseableAssetNames: () => Promise<string[]>
  // Ensures that the device is in a state where  the asset (by assetName) is usable
  // e.g for assetName Polygon, the Ethereum or Polygon app should be open on the Ledger
  ensureApplicationIsOpened: (assetName: EnsureApplicationIsOpenedParams) => Promise<void>
  // Forcibly cancels the pending operation on the device
  cancelAction: () => Promise<void>
}

/**
 * ensureApplicationIsOpened(assetName)
 */
export type EnsureApplicationIsOpenedParams = string

export interface MultisigData {
  xpubs: string[]
  threshold: number
  internalXpub: string
}

/**
 * getAddress(...)
 */
export interface GetAddressParams {
  assetName: string
  derivationPath: string
  multisigData?: MultisigData
  displayOnDevice?: boolean
}

/**
 * getXPub(...)
 */
export interface GetXPubParams {
  assetName: string
  derivationPath: string
}

/**
 * getPublicKey(...)
 */
export interface GetPublicKeyParams {
  assetName: string
  derivationPath: string
}

/**
 * signTransaction(...)
 */
export interface SignTransactionParams {
  assetName: string
  derivationPaths: [string, ...string[]] // The minimum is 1 string.
  derivationPathsMap?: Record<string, string>
  signableTransaction: SignableTransaction
  multisigData?: MultisigData
}

/**
 * SignableTransactions are the transactions in serialized format to be signed.
 */
export type SignableTransaction = Bytes | { serialize: () => Bytes }

/**
 * signMessage(...)
 */
export interface SignMessageParams<IMessage = Message> {
  assetName: string
  derivationPath: string
  message: IMessage
}
export interface Message {
  rawMessage?: Bytes
}
