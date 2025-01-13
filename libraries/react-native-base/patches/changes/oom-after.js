const path = require('path')
const { directories } = require('../../utils/context')

exports.after = {
  disableResponseClone: {
    val: `Response.prototype.clone = function() {
  throw new Error('response.clone has been disabled to avoid out-of-memory issues in react-native')
}`,
    filePath: path.join(directories.nodeModules.prod.absolute, 'whatwg-fetch/fetch.js'),
  },
  deallocateBlob: {
    val: `function fileReaderReady(reader, blob) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result)
      try {
        blob.close()
      }
      catch(e){
        console.warn('failed to de-allocate blob memory', e)
      }
    }
    reader.onerror = function() {
      reject(reader.error)
    }
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader, blob)
  reader.readAsArrayBuffer(blob)
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader, blob)
  reader.readAsText(blob)
  return promise
}`,
    filePath: path.join(directories.nodeModules.prod.absolute, 'whatwg-fetch/fetch.js'),
  },
}
