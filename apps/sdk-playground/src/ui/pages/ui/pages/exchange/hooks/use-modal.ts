import pDefer from 'p-defer'
import { useCallback, useState } from 'react'

type ModalDefinition<T> = T & {
  onClick: (value: any) => void
}

type ShowModal<T> = (params: T) => Promise<any>

function useModal<T = any>(): [ModalDefinition<T> | null, ShowModal<T>] {
  const [current, setCurrent] = useState<ModalDefinition<T> | null>(null)

  const show = useCallback(async (params: T = {} as T) => {
    const resultDefer = pDefer()

    let result: any

    setCurrent({
      ...params,
      onClick: (value) => {
        result = value
        resultDefer.resolve()
      },
    })

    await resultDefer.promise

    setCurrent(null)

    return result
  }, [])

  return [current, show]
}

export default useModal
