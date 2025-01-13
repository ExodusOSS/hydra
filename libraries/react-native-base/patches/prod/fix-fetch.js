#!/usr/bin/env node

const path = require('path')

const applyPatch = require('../apply-patch')
const { reactNativeVersion, directories } = require('../../utils/context')

const before = `    xhr.onload = function() {
      var options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
      var body = 'response' in xhr ? xhr.response : xhr.responseText
      resolve(new Response(body, options))
    }`

const after = `    xhr.onload = function() {
      try {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      } catch(ignore) {
        reject(new TypeError('Network request failed'));
      }
    };`

const fixFetch = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken fetch fix')

  console.log('# Fixing fetch')
  applyPatch(
    path.join(directories.nodeModules.prod.absolute, 'whatwg-fetch/fetch.js'),
    before,
    after
  )
}

fixFetch()
