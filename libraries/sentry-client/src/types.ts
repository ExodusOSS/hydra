import type { SafeError } from '@exodus/errors'

export type JsEngine = 'jsc' | 'hermes'
export type Environment = 'staging' | 'production'

export interface SentryConfig {
  publicKey: string
  projectId: string
  environment: Environment
  dsnUrl: string
  os: string
  osVersion: string
  platform: string
  appName: string
  appVersion: string
  buildId: string
  jsEngine: JsEngine
}

export interface SentryStackFrame {
  async?: boolean
  method?: string
  lineno?: number
  colno?: number
  filename?: string
  function?: string
  in_app?: boolean
}

export interface SentryError {
  event_id: string
  timestamp: number
  platform: string
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  release: string
  dist: string
  tags: {
    os: string
    osVersion: string
    platform: string
    appVersion: string
  }
  environment: Environment
  exception: {
    values: {
      type: string
      value?: string
      stacktrace: {
        frames: SentryStackFrame[]
      }
    }[]
  }
}

export type UnsafeContext = unknown

export interface ToSentryErrorParams {
  unsafeError: Error
  config: SentryConfig
  unsafeContext: UnsafeContext
}

export interface SentryConstructorOptions {
  config: SentryConfig
}

// "{header}\n{item_header}\n{item_payload}".
export type Envelope = string & { readonly __brand: 'SentryEnvelope' }

export type RelativePath = string & { readonly __brand: 'RelativePath' }

export type SubmitEnvelopeFunction = (
  path: RelativePath,
  options: { body: Envelope }
) => Promise<Response>

export interface RewriteFilenameParams {
  frame: SentryStackFrame
  jsEngine: JsEngine
}

export interface FormatStackFramesParams {
  frames: NonNullable<SafeError['stackFrames']>
  jsEngine: JsEngine
}

export interface EnvelopeHeader {
  event_id: string
}

export interface ItemHeader {
  type: string
}
