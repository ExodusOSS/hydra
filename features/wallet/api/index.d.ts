type SeedMetadata = { [seedId: string]: { label: string; dateCreated: number } }
type SeedId = string

declare const walletApiDefinition: {
  id: 'walletApi'
  type: 'api'
  factory(): {
    wallet: {
      exists(): Promise<boolean>
      hasPassphraseSet(): Promise<boolean>
      isLocked(): Promise<boolean>
      getMnemonic(opts?: { passphrase?: string }): Promise<string>
      getSeedMetadata(): Promise<SeedMetadata>
      getPrimarySeedId(): Promise<string>
      create(opts?: { mnemonic?: string; passphrase?: string }): Promise<{ seedId: SeedId }>
      import(opts?: { mnemonic: string; passphrase?: string }): Promise<{ seedId: SeedId }>
      clear(): Promise<void>
      lock(): Promise<void>
      unlock(opts?: { passphrase?: string }): Promise<void>
      changePassphrase(opts: { currentPassphrase: string; newPassphrase: string }): Promise<void>
    }
  }
}

export default walletApiDefinition
