import Fuse from 'fuse.js'
import { useMemo } from 'react'

// returns search results using 'fuse.js' npm library
// see https://www.fusejs.io/examples.html for examples how to use it
//
// ```
// const results = useFuseSearch(data, query, fuseOptions)
// ```
const useFuseSearch = (data = [], query, fuseOptions) => {
  const fuse = useMemo(() => new Fuse(data, fuseOptions), [data, fuseOptions])

  const results = useMemo(() => fuse.search(query), [fuse, query])

  return query && query.length > 0 ? results : data
}

export default useFuseSearch
