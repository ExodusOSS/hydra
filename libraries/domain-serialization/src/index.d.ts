import type { AbstractAsset as Asset } from '@exodus/asset-types'

type DictionaryOrArray<X> = X[] | Record<string, X>

/**
 * Serializes a domain object to a string representation
 * @param instance - A domain object instance to serialize
 * @returns The serialized representation of the provided instance
 */
export type DomainSerializationHandler = (value: any) => string

/**
 * Deserializes a string representation of a domain object instance.
 * @param serialized - The serialized representation of the instance
 * @returns A domain object instance
 */
export type DomainDeserializationHandler = (serialized: string) => any

/**
 * Wrapper containing handlers for serialization and deserialization of domain objects
 */
export type DomainSerialization = {
  serialize: DomainSerializationHandler
  deserialize: DomainDeserializationHandler
}

export type TypeDefinition<T = any> = {
  type: string
  test: (value: unknown) => boolean
  serialize: (value: T) => string
  deserialize: (serialized: string) => T
}

/**
 * The configuration for trivial serialization and deserialization of domain objects.
 */
export type DomainSerializationConfig = {
  /**
   *  Function to customize the assets serialization
   *  @param asset - An asset instance
   *  @returns A serialized string representation of the asset instance
   */
  serializeAsset?: (asset: Asset) => string

  /**
   *  Function to customize the assets deserialization
   *  @param serializedAsset - A serialized asset string
   *  @returns The deserialized asset instance
   */
  deserializeAsset?: (serializedAsset: string) => Asset

  /**
   * Function to customize assets deserialization, is preferred over `deserializeAsset` if both are informed
   *  @param serializedAssets - An array of serialized asset strings
   *  @returns An array of deserialized asset instances
   */
  deserializeAssets?: (serializedAssets: string[]) => Asset[]

  /**
   * A dictionary of domain object types to be skipped from domain serialization, keys should be in lowercase
   * @example
   * ```js
   * const excludeSerialization = { numberunit: true, personalnoteset: true }
   * ```
   */
  excludeSerialization?: Record<string, boolean>

  /**
   * An array of extra type definitions that are specific to a project
   * and don't make sense to be upstreamed into this library
   */
  extraTypeDefinitions?: TypeDefinition[]
}

/**
 * A function to handle proxy calls for asset APIs, allowing dynamic routing
 * of API calls to specific asset instances. This function serializes arguments
 * for remote execution and handles the return of deserialized results.
 * @param assetName - The name of the asset for which the API function is being called
 * @param args - The arguments to be passed to the API function on the specified asset
 * @returns A promise that resolves with the deserialized result of the API call
 */
export type AssetApiProxyFunction = (assetName: string, ...args: any[]) => Promise<any>

/**
 * The configuration for serializaton and deserialization of domain objects, tweaked to work with the UI process
 */
export type UIDomainSerializationConfig = {
  getStoredAssets: () => DictionaryOrArray<Asset>
  proxyFunction: AssetApiProxyFunction
}

/**
 * Serializes an asset object to a serializable format.
 * Removes server-side-only properties and serializes specific fields.
 * @param asset - The asset object to be serialized
 * @returns An object representing the serialized asset
 */
export function serializeAsset(asset: Asset): string

/**
 * Serializes an array or dictionary of assets.
 * @param assets - Assets to be serialized
 * @returns The deserialized assets
 */
export function serializeAssets(assets: DictionaryOrArray<Asset>): DictionaryOrArray<string>

/**
 * Deserializes an array of assets for use in the application.
 * Also takes into consideration dependencies between assets
 * @param assetsList - List of assets to deserialize
 * @param assets - All available assets
 * @param proxyFunction - A function to handle proxy calls for asset APIs
 * @returns An array of fully deserialized asset objects
 */
export function deserializeAssets(
  assetsList: string[],
  assets: Record<string, Asset>,
  proxyFunction: (assetName: string, ...args: any[]) => any
): object[]

/**
 * Proxy function to perform API calls on an asset, calling the appropriate method on the asset's API.
 * Serializes arguments for the API call and deserializes the response.
 * @param asset - The asset object to call the API on
 * @param functionName - Name of the function to call on the asset's API
 * @param args - Arguments for the function
 * @returns A promise that resolves with the serialized result of the API call
 */
export async function assetsApi(
  asset: object,
  functionName: string,
  ...args: any[]
): Promise<string>

/**
 * Creates a domain serialization handler specifically for UI wallet processes.
 * This handler customizes serialization and deserialization of assets, ensuring
 * assets are serialized in a lightweight, proxied form suitable for the UI.
 * @param config - Configuration object for UI domain serialization
 * @returns Serialization handlers tweaked to work in the UI process
 * @throws Will throw an error if `getStoredAssets` or `proxyFunction` is not provided
 */
export function createUIDomainSerialization(
  config: UIDomainSerializationConfig
): DomainSerialization

/**
 * Creates a domain serialization handler specifically for backend wallet processes.
 * This handler customizes serialization and deserialization of assets for backend use cases,
 * including error handling for deserialization attempts in unsupported scenarios.
 * @returns Serialization handlers tweaked to work in the UI process
 */
export function createBackendDomainSerialization(): DomainSerialization

/**
 * Create serialization handlers for a wide range of domain and native objects
 * @param config - Overrides and tweaks for serialization/deserialization
 * @returns The handlers for both serialization and deserialization of domain objects
 */
export default function createDomainSerialization(
  config?: DomainSerializationConfig
): DomainSerialization
