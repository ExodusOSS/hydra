import type addressProvider from '@exodus/address-provider'
import type application from '@exodus/application'
import type { type Node, Argo, Definition, Feature, InstanceById } from '@exodus/argo'
import type assetSources from '@exodus/asset-sources'
import type assets from '@exodus/assets-feature'
import type availableAssets from '@exodus/available-assets'
import type blockchainMetadata from '@exodus/blockchain-metadata'
import type enabledAssets from '@exodus/enabled-assets'
import type errorTracking from '@exodus/error-tracking'
import type featureFlags from '@exodus/feature-flags'
import type fees from '@exodus/fee-data-monitors'
import type txLogMonitors from '@exodus/tx-log-monitors'
import type keyViewer from '@exodus/key-viewer'
import type keychain from '@exodus/keychain'
import type locale from '@exodus/locale'
import type messageSigner from '@exodus/message-signer'
import type pricing from '@exodus/pricing'
import type publicKeyProvider from '@exodus/public-key-provider'
import type rates from '@exodus/rates-monitor'
import type remoteConfig from '@exodus/remote-config'
import type txSigner from '@exodus/tx-signer'
import type wallet from '@exodus/wallet'
import type walletAccounts from '@exodus/wallet-accounts'
import type cachedSodiumEncryptor from '@exodus/cached-sodium-encryptor'

type ApiDefinitions<F extends Feature> = Extract<
  F['definitions'][number]['definition'],
  { type: 'api' }
>

type ReportDefinitions<F extends Feature> = Extract<
  F['definitions'][number]['definition'],
  { type: 'report' }
>

type DebugDefinitions<F extends Feature> = Extract<
  F['definitions'][number]['definition'],
  { type: 'debug' }
>

type Values<D extends object> = D[keyof D]

type FeatureFactory = (...args: any[]) => Feature

type FeatureApi<F extends FeatureFactory> = Values<InstanceById<ApiDefinitions<ReturnType<F>>>>

type FeatureDebug<F extends FeatureFactory> = Values<InstanceById<DebugDefinitions<ReturnType<F>>>>

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never

type DefinitionsApi<D extends Definition> = UnionToIntersection<
  Values<InstanceById<Extract<D, { type: 'api' }>>>
>

type DefinitionsDebug<D extends Definition> = UnionToIntersection<
  Values<InstanceById<Extract<D, { type: 'debug' }>>>
>

export interface ApplicationWalletApi {
  addSeed(params: { mnemonic: string; compatibilityMode: string }): Promise<string>
  start(): Promise<void>
  stop(): Promise<void>
  load(): Promise<void>
  unload(): Promise<void>
  create(params?: { mnemonic?: string; passphrase?: string }): Promise<void>
  lock(): Promise<void>
  unlock(params?: { passphrase?: string }): Promise<void>
  import(params: {
    mnemonic: string
    passphrase?: string
    forceRestart?: boolean
    forgotPassphrase?: boolean
    compatibilityMode?: string
  }): Promise<void>
  delete(params?: { forgotPassphrase?: boolean; restartOptions?: any }): Promise<void>
  getMnemonic(params?: { passphrase?: string }): Promise<string>
  setBackedUp(): Promise<void>
  changePassphrase(params: { currentPassphrase: string; newPassphrase: string }): Promise<void>
  changeLockTimer(params: { ttl: number }): Promise<void>
  restartAutoLockTimer(): Promise<void>
  restoreFromCurrentPhrase(params?: { passphrase?: string }): Promise<void>
}

export type DebugApi = {
  debug: FeatureDebug<typeof addressProvider> & FeatureDebug<typeof walletAccounts>
}

type WalletApi = {
  wallet: Omit<FeatureApi<typeof wallet>['wallet'], keyof ApplicationWalletApi> &
    ApplicationWalletApi
}

type ReportNode<F extends FeatureFactory> = Values<InstanceById<ReportDefinitions<ReturnType<F>>>>

type ReportFactory<F extends FeatureFactory> = ReportNode<F>['export']

type ReportSlice<F extends FeatureFactory> = Record<
  ReturnType<F>['id'],
  Awaited<ReturnType<ReportFactory<F>>>
>

export type Report = ReportSlice<typeof txSigner> &
  ReportSlice<typeof messageSigner> &
  ReportSlice<typeof walletAccounts> &
  ReportSlice<typeof addressProvider> &
  ReportSlice<typeof remoteConfig> &
  ReportSlice<typeof assets> &
  ReportSlice<typeof availableAssets> &
  ReportSlice<typeof blockchainMetadata> &
  ReportSlice<typeof enabledAssets> &
  ReportSlice<typeof locale> &
  ReportSlice<typeof pricing> &
  ReportSlice<typeof rates> &
  ReportSlice<typeof featureFlags> &
  ReportSlice<typeof fees> &
  ReportSlice<typeof keychain> &
  ReportSlice<typeof keyViewer> &
  ReportSlice<typeof assetSources> &
  ReportSlice<typeof application> &
  ReportSlice<typeof errorTracking> &
  ReportSlice<typeof txLogMonitors>

type ReportingApi = {
  reporting: {
    export: () => Promise<Report>
  }
}

export type ExodusApi = FeatureApi<typeof publicKeyProvider> &
  FeatureApi<typeof txSigner> &
  FeatureApi<typeof messageSigner> &
  FeatureApi<typeof walletAccounts> &
  FeatureApi<typeof addressProvider> &
  FeatureApi<typeof remoteConfig> &
  FeatureApi<typeof assets> &
  FeatureApi<typeof availableAssets> &
  FeatureApi<typeof blockchainMetadata> &
  FeatureApi<typeof enabledAssets> &
  FeatureApi<typeof locale> &
  FeatureApi<typeof pricing> &
  FeatureApi<typeof rates> &
  FeatureApi<typeof featureFlags> &
  FeatureApi<typeof fees> &
  FeatureApi<typeof keychain> &
  FeatureApi<typeof keyViewer> &
  FeatureApi<typeof assetSources> &
  FeatureApi<typeof application> &
  FeatureApi<typeof errorTracking> &
  FeatureApi<typeof txLogMonitors> &
  FeatureApi<typeof cachedSodiumEncryptor> &
  WalletApi &
  ReportingApi &
  DebugApi

type Params = {
  adapters: Record<string, any>
  config: Record<string, any>
  debug?: boolean
}

interface ArgoWithApiResolver<D extends Definition>
  extends Omit<Argo<D>, 'use' | 'registerMultiple' | 'register' | 'resolve'> {
  register<N extends Node>(node: N): ArgoWithApiResolver<D | N['definition']>
  registerMultiple<N extends Node>(node: readonly N[]): ArgoWithApiResolver<D | N['definition']>
  use<F extends Feature>(
    feature: F
  ): ArgoWithApiResolver<D | F['definitions'][number]['definition']>
  resolve(): ExodusApi & DefinitionsApi<D> & DefinitionsDebug<D>
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function createExodus(params: Params): ArgoWithApiResolver<{}>
