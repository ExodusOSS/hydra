const path = require('path')
const { directories } = require('../../utils/context')

exports.before = {
  disableResponseClone: {
    val: `Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url
  })
}`,
    filePath: path.join(directories.nodeModules.prod.absolute, 'whatwg-fetch/fetch.js'),
  },
  deallocateBlob: {
    val: `function fileReaderReady(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result)
    }
    reader.onerror = function() {
      reject(reader.error)
    }
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsArrayBuffer(blob)
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsText(blob)
  return promise
}`,
    filePath: path.join(directories.nodeModules.prod.absolute, 'whatwg-fetch/fetch.js'),
  },
}
