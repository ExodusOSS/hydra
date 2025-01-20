import { useSelector } from 'react-redux'

import Text from '@/ui/components/text'
import Value from '@/ui/components/value'
import lodash from 'lodash'

const { kebabCase } = lodash

const Selector = ({ name, selector, returnType }) => {
  let result = useSelector(selector)
  let error = ''
  if (typeof result === 'function') {
    result = null
    error = 'Selectors that return functions are not support yet. How about a pull request?'
  }

  return (
    <div id={kebabCase(name)} className="mb-8 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
        <Text>{name}</Text>
      </div>
      <div className="flex justify-between bg-slate-50 px-4 py-2">
        <Text size={14}>result</Text>

        <Text className="opacity-60" size={12}>
          {returnType}
        </Text>
      </div>

      <div className="p-4">
        <Text className="mb-4" size={13}>
          <span className="mr-2">Status:</span>
          {result && <span className="mr-2 text-green-500">Success</span>}
          {error && <span className="mr-2 text-red-500">Error</span>}
        </Text>

        <Text className="mb-4" size={13}>
          <span className="mr-2">Value:</span>
          {error ? <span>{error}</span> : <Value value={result} />}
        </Text>
      </div>
    </div>
  )
}

export default Selector
