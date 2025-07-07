import createHeadless from '@exodus/headless'
import fusionLocal from '@exodus/fusion-local'
import syncTime from '@exodus/sync-time'
import eventLog from '@exodus/event-log'

const exodus = ({ adapters, config, debug }: { adapters: any; config: any; debug?: boolean }) => {
  const ioc = createHeadless({ adapters, config, debug })
  ioc.use(fusionLocal())
  ioc.use(syncTime())
  ioc.use(eventLog())
  return ioc.resolve()
}

export default exodus
