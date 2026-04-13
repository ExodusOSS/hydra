import type { RemoteConfigData, RemoteConfigType, Port } from '../types/index.js'
import type { Definition } from '@exodus/dependency-types'
import type { Atom, Unsubscribe } from '@exodus/atoms'

type RemoteConfigPluginDeps = {
  remoteConfig: RemoteConfigType
  remoteConfigAtom: Atom<RemoteConfigData>
  port: Port
}

const remoteConfigLifecyclePlugin = ({
  remoteConfig,
  remoteConfigAtom,
  port,
}: RemoteConfigPluginDeps) => {
  let unobserveRemoteConfig: Unsubscribe | undefined

  const sync = (config?: Record<string, any>) =>
    port.emit('remoteConfig', config ?? Object.create(null))

  const onLoad = async () => {
    const { config } = await remoteConfigAtom.get()
    sync(config)
  }

  const onStart = () => {
    unobserveRemoteConfig = remoteConfigAtom.observe(({ config }) => sync(config))
    void remoteConfig.load()
  }

  const onStop = () => {
    unobserveRemoteConfig?.()
    remoteConfig.stop()
  }

  const onUnlock = async () => {
    const { config } = await remoteConfigAtom.get()
    sync(config)
  }

  return { onLoad, onUnlock, onStart, onStop }
}

const remoteConfigPlugin = {
  id: 'remoteConfigPlugin',
  type: 'plugin',
  factory: remoteConfigLifecyclePlugin,
  dependencies: ['remoteConfig', 'remoteConfigAtom', 'port'],
  public: true,
} as const satisfies Definition

export default remoteConfigPlugin
