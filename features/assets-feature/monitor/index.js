import { Timer } from '@exodus/timer'
import ms from 'ms'

const createCustomTokensMonitor = ({ assetsModule, appProcess }) => {
  const timer = new Timer(ms('1m'))

  timer.callback = async () => {
    await appProcess?.awaitState('active')
    assetsModule.updateTokens()
  }

  return timer
}

const customTokensMonitorDefinition = {
  id: 'customTokensMonitor',
  type: 'monitor',
  factory: createCustomTokensMonitor,
  dependencies: ['assetsModule', 'appProcess?'],
  public: true,
}

export default customTokensMonitorDefinition
