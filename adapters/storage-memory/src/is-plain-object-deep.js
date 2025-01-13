import traverse from 'traverse'
import lodash from 'lodash'

const { isEqual } = lodash

const isPlainObjectDeep = (obj) => {
  let abort = false
  const copy = traverse(obj).map(function (value) {
    if (Buffer.isBuffer(value)) abort = true
    if (this.circular) abort = true

    if (abort) this.update(undefined, true) // stop
    if (value === undefined && !Array.isArray(this.parent.node)) {
      this.remove()
    }
  })

  if (abort) return false

  return isEqual(JSON.parse(JSON.stringify(obj)), copy)
}

export default isPlainObjectDeep
