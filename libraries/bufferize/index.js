import traverse from 'traverse'

// mutates obj
const bufferize = (obj) => {
  // Don't do anything if Buffer global is not defined (when no Node.js integration or Buffer polyfill)
  // This is managed per process, i.e. either we don't need this or we define a global Buffer in web proceeses that need it
  if (globalThis.Buffer === undefined) return obj

  traverse(obj).forEach(function (node) {
    if (node instanceof Uint8Array) this.update(globalThis.Buffer.from(node))
  })

  return obj
}

export default bufferize
