import { createAtomObserver } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

import type { RatesMonitor } from '../module/index.js'
import type { RatesByCurrency } from '../redux/types.js'

type Port = {
  emit(event: string, value: unknown): void
}

const createRatesLifecyclePlugin = ({
  ratesMonitor,
  port,
  ratesAtom,
}: {
  ratesMonitor: RatesMonitor
  port: Port
  ratesAtom: Atom<RatesByCurrency>
}) => {
  const observer = createAtomObserver({ port, atom: ratesAtom, event: 'rates' })
  observer.register()
  const onLoad = () => {
    void ratesMonitor.start()
    void observer.start()
  }

  const onStop = () => {
    observer.unregister()
    ratesMonitor.stop()
  }

  const onClear = async () => {}

  return { onLoad, onStop, onClear }
}

const ratesLifecyclePluginDefinition = {
  id: 'ratesLifecyclePlugin',
  type: 'plugin',
  factory: createRatesLifecyclePlugin,
  dependencies: ['ratesMonitor', 'port', 'ratesAtom'],
  public: true,
} as const satisfies Definition

export default ratesLifecyclePluginDefinition
