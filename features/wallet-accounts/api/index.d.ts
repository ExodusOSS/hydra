import type { WalletAccount } from '@exodus/models'

type WalletAccountsData = Partial<{
  id: string
  seedId: string
  compatibilityMode: string
  source: string
  index: number
  label: string
  enabled: string
}>

type UpdateableData = Omit<WalletAccountsData, 'id' | 'seedId' | 'index' | 'compatibilityMode'>

declare const walletAccountsApiDefinition: {
  id: 'walletAccountsApi'
  type: 'api'
  factory(): {
    walletAccounts: {
      create(data: WalletAccountsData): Promise<void>
      update(name: string, data: UpdateableData): Promise<void>
      disable(name: string): Promise<void>
      removeMany(names: string[]): Promise<void>
      enable(name: string): Promise<void>
      getEnabled(): Promise<{ [name: string]: WalletAccount }>
      getActive(): Promise<string>
      setActive(name: string): Promise<void>
      setMultipleEnabled(value: true): Promise<void>
    }
  }
}

export default walletAccountsApiDefinition
