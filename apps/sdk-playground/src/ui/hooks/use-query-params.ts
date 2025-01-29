import { useSearch } from 'wouter'

function useQueryParams(): Record<string, string | undefined> {
  const searchString = useSearch()
  const queryParams = new URLSearchParams(searchString)
  return Object.fromEntries(queryParams.entries())
}

export default useQueryParams
