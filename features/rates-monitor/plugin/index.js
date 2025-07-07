import { createAtomObserver } from '@exodus/atoms'

const createRatesLifecyclePlugin = ({
  ratesMonitor,
  port,
  ratesAtom,
  ratesSimulationEnabledAtom,
}) => {
  const ratesObserver = createAtomObserver({ port, atom: ratesAtom, event: 'rates' })
  const simulationEnabledObserver = createAtomObserver({
    port,
    atom: ratesSimulationEnabledAtom,
    event: 'ratesSimulationEnabled',
  })

  ratesObserver.register()
  simulationEnabledObserver.register()

  const onLoad = () => {
    ratesMonitor.disableSimulation()
    ratesMonitor.start()
    ratesObserver.start()
    simulationEnabledObserver.start()
  }

  const onStop = () => {
    ratesObserver.unregister()
    simulationEnabledObserver.unregister()
    ratesMonitor.stop()
  }

  const onClear = () => {
    ratesMonitor.disableSimulation()
  }

  return { onLoad, onStop, onClear }
}

const ratesLifecyclePluginDefinition = {
  id: 'ratesLifecyclePlugin',
  type: 'plugin',
  factory: createRatesLifecyclePlugin,
  dependencies: ['ratesMonitor', 'port', 'ratesAtom', 'ratesSimulationEnabledAtom'],
  public: true,
}

export default ratesLifecyclePluginDefinition
