import pDefer from 'p-defer'
import { useCallback, useState } from 'react'

type ModalDefinition = {
  title: string
  options: any[]
  onClick: (value: any) => void
}

type ShowModal = (definition: Omit<ModalDefinition, 'onClick'>) => Promise<any>

const useModal = (): [ModalDefinition | null, ShowModal] => {
  const [current, setCurrent] = useState<ModalDefinition | null>(null)

  const show = useCallback(async ({ title, options }) => {
    const resultDefer = pDefer()

    let result: any

    setCurrent({
      title,
      options,
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
