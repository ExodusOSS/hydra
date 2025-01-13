import { useEffect, useState } from 'react'

const getValue = (search, param) => new URLSearchParams(search).get(param)

// From: https://github.com/streamich/react-use/blob/master/src/useSearchParam.ts
const useQueryParam = (param) => {
  const location = window.location
  const [value, setValue] = useState(() => getValue(location.search, param))

  useEffect(() => {
    const onChange = () => {
      setValue(getValue(location.search, param))
    }

    window.addEventListener('popstate', onChange)
    window.addEventListener('pushstate', onChange)
    window.addEventListener('replacestate', onChange)

    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('pushstate', onChange)
      window.removeEventListener('replacestate', onChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return value
}

export default useQueryParam
