import type { RemoteConfigType, Port } from '../types/index.js'
import type { Definition } from '@exodus/dependency-types'

type RemoteConfigPluginDeps = {
  remoteConfig: RemoteConfigType
  port: Port
}

const remoteConfigLifecyclePlugin = ({ remoteConfig, port }: RemoteConfigPluginDeps) => {
  remoteConfig.on('sync', ({ current }) => port.emit('remoteConfig', current))

  const onLoad = () => {
    remoteConfig.sync()
  }

  const onStart = () => {
    void remoteConfig.load()
  }

  const onStop = () => {
    remoteConfig.stop()
  }

  const onUnlock = () => {
    remoteConfig.sync()
  }

  return { onLoad, onUnlock, onStart, onStop }
}

const remoteConfigPlugin = {
  id: 'remoteConfigPlugin',
  type: 'plugin',
  factory: remoteConfigLifecyclePlugin,
  dependencies: ['remoteConfig', 'port'],
  public: true,
} as const satisfies Definition

export default remoteConfigPlugin
