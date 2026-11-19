type SeedMetadata = Record<string, { label?: string; createdAt?: number }>

export declare class Wallet {
  exists(): Promise<boolean>
  hasPassphraseSet(): Promise<boolean>
  create(params: { mnemonic?: string; passphrase?: string }): Promise<void>
  import(params: { mnemonic: string; passphrase?: string }): Promise<void>
  clear(): Promise<void>
  isLocked(): Promise<boolean>
  lock(): Promise<void>
  unlock(params?: { passphrase?: string }): Promise<void>
  getMnemonic(params?: { passphrase?: string }): Promise<string>
  changePassphrase(params: { currentPassphrase: string; newPassphrase: string }): Promise<void>
  getSeedMetadata(): Promise<SeedMetadata>
  getPrimarySeedId(): Promise<string>
}

export default Wallet
