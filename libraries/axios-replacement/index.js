'use strict'

const { fetch } = require('@exodus/fetch')

const get = async function get(url){
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`request failed with code ${response.status}`)
  }
  const json = await response.json()
  return { data: json }
}

const request = function request(opts) {
  for (const opt of Object.keys(opts)) {
    if (!['method', 'url'].includes(opt)) {
      throw new Error(`invalid option: ${opt}`);
    }
  }
  if (opts.method !== 'GET') {
    throw new Error('only GET method is supported')
  }
  if (typeof opts.url !== 'string') {
    throw new Error('expected url to be a string')
  }
  return get(opts.url);
}

module.exports = { get, request }
