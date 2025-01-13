import { fetch } from '@exodus/fetch'
import { FetchFactory } from '@exodus/fetch-factory'

const fetchFactory = new FetchFactory(fetch)

const createFetch = () =>
  fetchFactory
    .setHeaders({
      'User-Agent': 'exodus/integration-tests:headless',
    })
    .create()

export default createFetch
