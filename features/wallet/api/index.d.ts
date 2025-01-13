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
      getMnemonic(opts?: { passphrase?: string; seedId?: SeedId }): Promise<boolean>
      getSeedMetadata(): Promise<SeedMetadata>
      getPrimarySeedId(): Promise<string>
      addSeed(params: { mnemonic: string; label: string }): Promise<string>
      updateSeed(params: { seedId: SeedId; label: string }): Promise<string>
      removeManySeeds(seedIds: string[]): Promise<void>
      removeSeed(seedId: string): Promise<void>
      create(opts?: { mnemonic?: string; passphrase?: string }): Promise<SeedId>
      import(opts?: { mnemonic: string; passphrase?: string }): Promise<SeedId>
      clear(): Promise<void>
      lock(): Promise<void>
      unlock(opts?: { passphrase?: string }): Promise<void>
      changePassphrase(opts: { currentPassphrase: string; newPassphrase: string }): Promise<void>
    }
  }
}

export default walletApiDefinition
