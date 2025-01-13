/* eslint-disable jsdoc/valid-types */
import { decodeAsync as decodeBase64 } from '../utils/base64.js'

/**
 * @this FileReader
 */
export function readAsArrayBuffer(blob) {
  if (this.readyState === this.LOADING) throw new Error('InvalidStateError')
  this._setReadyState(this.LOADING)
  this._result = null
  this._error = null

  const fr = new FileReader()

  // TODO: can we use fr.addEventListener('load', () => { ... })?
  // eslint-disable-next-line unicorn/prefer-add-event-listener
  fr.onload = () => {
    const base64Pattern = /data:\S+\/\S+;base64,/u
    const input = fr.result.replace(base64Pattern, '')

    decodeBase64(input).then((buffer) => {
      this._result = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      this._setReadyState(this.DONE)
    })
  }

  // eslint-disable-next-line unicorn/prefer-add-event-listener
  fr.onerror = () => {
    this._error = fr._error
    this._setReadyState(this.DONE)
  }

  fr.readAsDataURL(blob)
}
