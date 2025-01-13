import applications from './applications'
import ethereum from './ethereum'

const metadata = {
  applications: [applications.Polygon, applications.Ethereum],
  handler: ethereum.handler,
}

export default metadata
