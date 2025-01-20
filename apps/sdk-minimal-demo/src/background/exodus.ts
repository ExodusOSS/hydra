import createHeadless from '@exodus/headless'
import fusionLocal from '@exodus/fusion-local'
import syncTime from '@exodus/sync-time'

const exodus = ({ adapters, config, debug }: { adapters: any; config: any; debug?: boolean }) => {
  const ioc = createHeadless({ adapters, config, debug })
  ioc.use(fusionLocal())
  ioc.use(syncTime())
  return ioc.resolve()
}

export default exodus
