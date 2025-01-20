import JsonTree from '@/ui/components/json-tree'

const Value = ({ value }) => {
  if (value instanceof Uint8Array) {
    return `${Buffer.from(value).toString('hex')} (${value[Symbol.toStringTag]} as hex string)`
  }

  if (Array.isArray(value) && value.length === 0) {
    return '[]'
  }

  if (typeof value === 'object') {
    return <JsonTree data={value as object} />
  }

  if (typeof value === 'boolean') {
    return value.toString()
  }

  return value
}

export default Value
