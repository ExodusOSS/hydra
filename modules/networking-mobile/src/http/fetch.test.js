/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable unicorn/prefer-date-now */
/* eslint-disable unicorn/no-array-method-this-argument */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/no-for-loop */
/* eslint-disable unicorn/no-new-array */
/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable unicorn/prefer-add-event-listener */
/* eslint-disable no-new */
/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

import assert from 'assert'
import createTestServer from '../../__utils__/fetch-test-server'
import { HttpClient } from './index'

// Tests from https://github.com/github/fetch/blob/fb5b0cf42b470faf8c5448ab461d561f34380a30/test/test.js
// Helper server from https://github.com/github/fetch/blob/fb5b0cf42b470faf8c5448ab461d561f34380a30/test/server.js

const IEorEdge = /Edge\//.test(navigator?.userAgent) || /MSIE/.test(navigator?.userAgent)
const Chrome = /Chrome\//.test(navigator?.userAgent) && !IEorEdge
const Safari = /Safari\//.test(navigator?.userAgent) && !IEorEdge && !Chrome

const PORT = 3000

const baseUrl = `http://localhost:${PORT}`

const support = {
  url: (function (url) {
    try {
      return new URL(url).toString() === url
    } catch {
      return false
    }
  })('http://example.com/'),
  blob:
    'FileReader' in self &&
    'Blob' in self &&
    (function () {
      try {
        new Blob()
        return true
      } catch {
        return false
      }
    })(),
  formData: 'FormData' in self,
  arrayBuffer: 'ArrayBuffer' in self,
  aborting: 'signal' in new Request(''),
  permanentRedirect: !/Trident/.test(navigator.userAgent),
}

function readBlobAsText(blob) {
  if ('FileReader' in self) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.onerror = function () {
        reject(reader.error)
      }
      reader.readAsText(blob)
    })
  } else if ('FileReaderSync' in self) {
    return new FileReaderSync().readAsText(blob)
  } else {
    throw new ReferenceError('FileReader is not defined')
  }
}

function readBlobAsBytes(blob) {
  if ('FileReader' in self) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader()
      reader.onload = function () {
        const view = new Uint8Array(reader.result)
        resolve(Array.prototype.slice.call(view))
      }
      reader.onerror = function () {
        reject(reader.error)
      }
      reader.readAsArrayBuffer(blob)
    })
  } else if ('FileReaderSync' in self) {
    return new FileReaderSync().readAsArrayBuffer(blob)
  } else {
    throw new ReferenceError('FileReader is not defined')
  }
}

function arrayBufferFromText(text) {
  const buf = new ArrayBuffer(text.length)
  const view = new Uint8Array(buf)

  for (let i = 0; i < text.length; i++) {
    view[i] = text.charCodeAt(i)
  }
  return buf
}

function readArrayBufferAsText(buf) {
  const view = new Uint8Array(buf)
  const chars = new Array(view.length)

  for (let i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i])
  }
  return chars.join('')
}

const slice = Array.prototype.slice

function featureDependent(testOrSuite, condition) {
  ;(condition ? testOrSuite : testOrSuite.skip).apply(this, slice.call(arguments, 2))
}

describe('fetch test', function () {
  let server, originalFetch
  beforeAll(() => {
    originalFetch = global.fetch

    const client = new HttpClient(
      {
        writeFile: jest.fn(),
        TemporaryDirectoryPath: '/tmp/',
        unlink: jest.fn(),
      },
      'iOS',
      () => 'ABCD1234',
      originalFetch
    )
    global.fetch = client.fetch.bind(client)

    server = createTestServer()
    return server.listen(PORT)
  })
  afterAll(() => {
    global.fetch = originalFetch
    return server.close()
  })

  const nativeChrome = Chrome
  const nativeSafari = Safari
  const nativeEdge = /Edge\//.test(navigator?.userAgent)
  const firefox = navigator?.userAgent?.match(/Firefox\/(\d+)/)
  const brokenFF = firefox && firefox[1] <= 56
  const emptyDefaultStatusText = Chrome || (firefox && firefox[1] >= 67)
  const polyfillFirefox = false
  const omitSafari = Safari && navigator?.userAgent?.match(/Version\/(\d+\.\d+)/)[1] <= '11.1'

  // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
  function testBodyExtract(factory) {
    describe('body extract', function () {
      const expected = 'Hello World!'
      let inputs = [['type USVString', expected]]
      if (support.blob) {
        inputs.push(['type Blob', new Blob([expected])])
      }
      if (support.arrayBuffer) {
        inputs = inputs.concat([
          ['type ArrayBuffer', arrayBufferFromText(expected)],
          ['type TypedArray', new Uint8Array(arrayBufferFromText(expected))],
          ['type DataView', new DataView(arrayBufferFromText(expected))],
        ])
      }

      inputs.forEach(function (input) {
        const typeLabel = input[0]
        const body = input[1]

        describe(typeLabel, function () {
          featureDependent(test, support.blob, 'consume as blob', function () {
            const r = factory(body)
            return r
              .blob()
              .then(readBlobAsText)
              .then(function (text) {
                assert.strictEqual(text, expected)
              })
          })

          test('consume as text', function () {
            const r = factory(body)
            return r.text().then(function (text) {
              assert.strictEqual(text, expected)
            })
          })

          featureDependent(test, support.arrayBuffer, 'consume as array buffer', function () {
            const r = factory(body)
            return r
              .arrayBuffer()
              .then(readArrayBufferAsText)
              .then(function (text) {
                assert.strictEqual(text, expected)
              })
          })
        })
      })
    })
  }

  // https://fetch.spec.whatwg.org/#headers-class
  describe('Headers', function () {
    test('constructor copies headers', function () {
      const original = new Headers()
      original.append('Accept', 'application/json')
      original.append('Accept', 'text/plain')
      original.append('Content-Type', 'text/html')

      const headers = new Headers(original)
      assert.strictEqual(headers.get('Accept'), 'application/json, text/plain')
      assert.strictEqual(headers.get('Content-type'), 'text/html')
    })
    test('constructor works with arrays', function () {
      const array = [
        ['Content-Type', 'text/xml'],
        ['Breaking-Bad', '<3'],
      ]
      const headers = new Headers(array)

      assert.strictEqual(headers.get('Content-Type'), 'text/xml')
      assert.strictEqual(headers.get('Breaking-Bad'), '<3')
    })
    test('headers are case insensitive', function () {
      const headers = new Headers({ Accept: 'application/json' })
      assert.strictEqual(headers.get('ACCEPT'), 'application/json')
      assert.strictEqual(headers.get('Accept'), 'application/json')
      assert.strictEqual(headers.get('accept'), 'application/json')
    })
    test('appends to existing', function () {
      const headers = new Headers({ Accept: 'application/json' })
      assert.strictEqual(headers.has('Content-Type'), false)
      headers.append('Content-Type', 'application/json')
      assert.strictEqual(headers.has('Content-Type'), true)
      assert.strictEqual(headers.get('Content-Type'), 'application/json')
    })
    test('appends values to existing header name', function () {
      const headers = new Headers({ Accept: 'application/json' })
      headers.append('Accept', 'text/plain')
      assert.strictEqual(headers.get('Accept'), 'application/json, text/plain')
    })
    test('sets header name and value', function () {
      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      assert.strictEqual(headers.get('Content-Type'), 'application/json')
    })
    test('returns null on no header found', function () {
      const headers = new Headers()
      assert.strictEqual(headers.get('Content-Type'), null)
    })
    test('has headers that are set', function () {
      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      assert.strictEqual(headers.has('Content-Type'), true)
    })
    test('deletes headers', function () {
      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      assert.strictEqual(headers.has('Content-Type'), true)
      headers.delete('Content-Type')
      assert.strictEqual(headers.has('Content-Type'), false)
      assert.strictEqual(headers.get('Content-Type'), null)
    })
    test('converts field name to string on set and get', function () {
      const headers = new Headers()
      headers.set(1, 'application/json')
      assert.strictEqual(headers.has('1'), true)
      assert.strictEqual(headers.get(1), 'application/json')
    })
    test('converts field value to string on set and get', function () {
      const headers = new Headers()
      headers.set('Content-Type', 1)
      headers.set('X-CSRF-Token', undefined)
      assert.strictEqual(headers.get('Content-Type'), '1')
      assert.strictEqual(headers.get('X-CSRF-Token'), 'undefined')
    })
    test('throws TypeError on invalid character in field name', function () {
      assert.throws(function () {
        new Headers({ '[Accept]': 'application/json' })
      }, TypeError)
      assert.throws(function () {
        new Headers({ 'Accept:': 'application/json' })
      }, TypeError)
      assert.throws(function () {
        const headers = new Headers()
        headers.set({ field: 'value' }, 'application/json')
      }, TypeError)
      assert.throws(function () {
        new Headers({ '': 'application/json' })
      }, TypeError)
    })
    featureDependent(test, !brokenFF, 'is iterable with forEach', function () {
      const headers = new Headers()
      headers.append('Accept', 'application/json')
      headers.append('Accept', 'text/plain')
      headers.append('Content-Type', 'text/html')

      const results = []
      headers.forEach(function (value, key, object) {
        results.push({ value, key, object })
      })

      assert.strictEqual(results.length, 2)
      assert.deepStrictEqual(
        { key: 'accept', value: 'application/json, text/plain', object: headers },
        results[0]
      )
      assert.deepStrictEqual(
        { key: 'content-type', value: 'text/html', object: headers },
        results[1]
      )
    })
    test.skip('forEach accepts second thisArg argument', function () {
      const headers = new Headers({ Accept: 'application/json' })
      const thisArg = 42
      headers.forEach(function () {
        assert.strictEqual(this, thisArg)
      }, thisArg)
    })
    featureDependent(test, !brokenFF, 'is iterable with keys', function () {
      const headers = new Headers()
      headers.append('Accept', 'application/json')
      headers.append('Accept', 'text/plain')
      headers.append('Content-Type', 'text/html')

      const iterator = headers.keys()
      assert.deepStrictEqual({ done: false, value: 'accept' }, iterator.next())
      assert.deepStrictEqual({ done: false, value: 'content-type' }, iterator.next())
      assert.deepStrictEqual({ done: true, value: undefined }, iterator.next())
    })
    featureDependent(test, !brokenFF, 'is iterable with values', function () {
      const headers = new Headers()
      headers.append('Accept', 'application/json')
      headers.append('Accept', 'text/plain')
      headers.append('Content-Type', 'text/html')

      const iterator = headers.values()
      assert.deepStrictEqual(
        { done: false, value: 'application/json, text/plain' },
        iterator.next()
      )
      assert.deepStrictEqual({ done: false, value: 'text/html' }, iterator.next())
      assert.deepStrictEqual({ done: true, value: undefined }, iterator.next())
    })
    featureDependent(test, !brokenFF, 'is iterable with entries', function () {
      const headers = new Headers()
      headers.append('Accept', 'application/json')
      headers.append('Accept', 'text/plain')
      headers.append('Content-Type', 'text/html')

      const iterator = headers.entries()
      assert.deepStrictEqual(
        { done: false, value: ['accept', 'application/json, text/plain'] },
        iterator.next()
      )
      assert.deepStrictEqual({ done: false, value: ['content-type', 'text/html'] }, iterator.next())
      assert.deepStrictEqual({ done: true, value: undefined }, iterator.next())
    })
  })

  // https://fetch.spec.whatwg.org/#request-class
  describe('Request', function () {
    test('called as normal function', function () {
      assert.throws(function () {
        Request('https://fetch.spec.whatwg.org/')
      })
    })
    test('construct with string url', function () {
      const request = new Request('https://fetch.spec.whatwg.org/')
      assert.strictEqual(request.url, 'https://fetch.spec.whatwg.org/')
    })

    featureDependent(test, support.url, 'construct with URL instance', function () {
      const url = new URL('https://fetch.spec.whatwg.org/')
      url.pathname = 'cors'
      const request = new Request(url)
      assert.strictEqual(request.url, 'https://fetch.spec.whatwg.org/cors')
    })

    test('construct with non-Request object', function () {
      const url = {
        toString: function () {
          return 'https://fetch.spec.whatwg.org/'
        },
      }
      const request = new Request(url)
      assert.strictEqual(request.url, 'https://fetch.spec.whatwg.org/')
    })

    test('construct with Request', function () {
      const request1 = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
        headers: {
          accept: 'application/json',
          'Content-Type': 'text/plain',
        },
      })
      const request2 = new Request(request1)

      return request2.text().then(function (body2) {
        assert.strictEqual(body2, 'I work out')
        assert.strictEqual(request2.method, 'POST')
        assert.strictEqual(request2.url, 'https://fetch.spec.whatwg.org/')
        assert.strictEqual(request2.headers.get('accept'), 'application/json')
        assert.strictEqual(request2.headers.get('content-type'), 'text/plain')

        return request1.text().then(
          function () {
            assert(false, 'original request body should have been consumed')
          },
          function (error) {
            assert(error instanceof TypeError, 'expected TypeError for already read body')
          }
        )
      })
    })

    test('construct with Request and override headers', function () {
      const request1 = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
        headers: {
          accept: 'application/json',
          'X-Request-ID': '123',
        },
      })
      const request2 = new Request(request1, {
        headers: { 'x-test': '42' },
      })

      assert.equal(request2.headers.get('accept'), undefined)
      assert.equal(request2.headers.get('x-request-id'), undefined)
      assert.strictEqual(request2.headers.get('x-test'), '42')
    })

    test('construct with Request and override body', function () {
      const request1 = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      const request2 = new Request(request1, {
        body: '{"wiggles": 5}',
        headers: { 'Content-Type': 'application/json' },
      })

      return request2.json().then(function (data) {
        assert.strictEqual(data.wiggles, 5)
        assert.strictEqual(request2.headers.get('content-type'), 'application/json')
      })
    })

    featureDependent(test, !nativeChrome, 'construct with used Request body', function () {
      const request1 = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
      })

      return request1.text().then(function () {
        assert.throws(function () {
          new Request(request1)
        }, TypeError)
      })
    })

    test('GET should not have implicit Content-Type', function () {
      const req = new Request('https://fetch.spec.whatwg.org/')
      assert.equal(req.headers.get('content-type'), undefined)
    })

    test('POST with blank body should not have implicit Content-Type', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
      })
      assert.equal(req.headers.get('content-type'), undefined)
    })

    test('construct with string body sets Content-Type header', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
      })

      assert.strictEqual(req.headers.get('content-type'), 'text/plain;charset=UTF-8')
    })

    featureDependent(
      test,
      support.blob,
      'construct with Blob body and type sets Content-Type header',
      function () {
        const req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: new Blob(['test'], { type: 'image/png' }),
        })

        assert.strictEqual(req.headers.get('content-type'), 'image/png')
      }
    )

    test('construct with body and explicit header uses header', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        headers: { 'Content-Type': 'image/png' },
        body: 'I work out',
      })

      assert.strictEqual(req.headers.get('content-type'), 'image/png')
    })

    featureDependent(
      test,
      support.blob,
      'construct with Blob body and explicit Content-Type header',
      function () {
        const req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          headers: { 'Content-Type': 'image/png' },
          body: new Blob(['test'], { type: 'text/plain' }),
        })

        assert.strictEqual(req.headers.get('content-type'), 'image/png')
      }
    )

    featureDependent(
      test,
      !IEorEdge,
      'construct with URLSearchParams body sets Content-Type header',
      function () {
        const req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          body: new URLSearchParams('a=1&b=2'),
        })

        assert.strictEqual(
          req.headers.get('content-type'),
          'application/x-www-form-urlencoded;charset=UTF-8'
        )
      }
    )

    featureDependent(
      test,
      !IEorEdge,
      'construct with URLSearchParams body and explicit Content-Type header',
      function () {
        const req = new Request('https://fetch.spec.whatwg.org/', {
          method: 'post',
          headers: { 'Content-Type': 'image/png' },
          body: new URLSearchParams('a=1&b=2'),
        })

        assert.strictEqual(req.headers.get('content-type'), 'image/png')
      }
    )

    test('construct with unsupported body type', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: {},
      })

      assert.strictEqual(req.headers.get('content-type'), 'text/plain;charset=UTF-8')
      return req.text().then(function (bodyText) {
        assert.strictEqual(bodyText, '[object Object]')
      })
    })

    test('construct with null body', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
      })

      assert.strictEqual(req.headers.get('content-type'), null)
      return req.text().then(function (bodyText) {
        assert.strictEqual(bodyText, '')
      })
    })

    test('clone GET request', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        headers: { 'content-type': 'text/plain' },
      })
      const clone = req.clone()

      assert.strictEqual(clone.url, req.url)
      assert.strictEqual(clone.method, 'GET')
      assert.strictEqual(clone.headers.get('content-type'), 'text/plain')
      assert.notStrictEqual(clone.headers, req.headers)
      assert.strictEqual(req.bodyUsed, false)
    })

    test('clone POST request', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        headers: { 'content-type': 'text/plain' },
        body: 'I work out',
      })
      const clone = req.clone()

      assert.strictEqual(clone.method, 'POST')
      assert.strictEqual(clone.headers.get('content-type'), 'text/plain')
      assert.notStrictEqual(clone.headers, req.headers)
      assert.strictEqual(req.bodyUsed, false)

      return Promise.all([clone.text(), req.clone().text()]).then(function (bodies) {
        assert.deepStrictEqual(bodies, ['I work out', 'I work out'])
      })
    })

    featureDependent(test, !nativeChrome, 'clone with used Request body', function () {
      const req = new Request('https://fetch.spec.whatwg.org/', {
        method: 'post',
        body: 'I work out',
      })

      return req.text().then(function () {
        assert.throws(function () {
          req.clone()
        }, TypeError)
      })
    })

    testBodyExtract(function (body) {
      return new Request('', { method: 'POST', body })
    })

    featureDependent(test, !omitSafari, 'credentials defaults to same-origin', function () {
      const request = new Request('')
      assert.strictEqual(request.credentials, 'same-origin')
    })

    test('credentials is overridable', function () {
      const request = new Request('', { credentials: 'omit' })
      assert.strictEqual(request.credentials, 'omit')
    })
  })

  // https://fetch.spec.whatwg.org/#response-class
  describe('Response', function () {
    featureDependent(test, emptyDefaultStatusText, 'default status is 200', function () {
      const res = new Response()
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.statusText, '')
      assert.strictEqual(res.ok, true)
    })

    featureDependent(
      test,
      emptyDefaultStatusText,
      'default status is 200 when an explicit undefined status code is passed',
      function () {
        const res = new Response('', { status: undefined })
        assert.strictEqual(res.status, 200)
        assert.strictEqual(res.statusText, '')
        assert.strictEqual(res.ok, true)
      }
    )

    testBodyExtract(function (body) {
      return new Response(body)
    })

    test('called as normal function', function () {
      assert.throws(function () {
        Response('{"foo":"bar"}', { headers: { 'content-type': 'application/json' } })
      })
    })
    test('creates Headers object from raw headers', function () {
      const r = new Response('{"foo":"bar"}', { headers: { 'content-type': 'application/json' } })
      assert.strictEqual(r.headers instanceof Headers, true)
      return r.json().then(function (json) {
        assert.strictEqual(json.foo, 'bar')
        return json
      })
    })

    test('always creates a new Headers instance', function () {
      const headers = new Headers({ 'x-hello': 'world' })
      const res = new Response('', { headers })

      assert.strictEqual(res.headers.get('x-hello'), 'world')
      assert.notStrictEqual(res.headers, headers)
    })

    test('clone text response', function () {
      const res = new Response('{"foo":"bar"}', {
        headers: { 'content-type': 'application/json' },
      })
      const clone = res.clone()

      assert.notStrictEqual(clone.headers, res.headers, 'headers were cloned')
      assert.strictEqual(clone.headers.get('content-type'), 'application/json')

      return Promise.all([clone.json(), res.json()]).then(function (jsons) {
        assert.deepStrictEqual(jsons[0], jsons[1], 'json of cloned object is the same as original')
      })
    })

    featureDependent(test, support.blob, 'clone blob response', function () {
      const req = new Request(new Blob(['test']))
      req.clone()
      assert.strictEqual(req.bodyUsed, false)
    })

    test('error creates error Response', function () {
      const r = Response.error()
      assert(r instanceof Response)
      assert.strictEqual(r.status, 0)
      assert.strictEqual(r.statusText, '')
      assert.strictEqual(r.type, 'error')
    })

    test('redirect creates redirect Response', function () {
      const r = Response.redirect('https://fetch.spec.whatwg.org/', 301)
      assert(r instanceof Response)
      assert.strictEqual(r.status, 301)
      assert.strictEqual(r.headers.get('Location'), 'https://fetch.spec.whatwg.org/')
    })

    test('construct with string body sets Content-Type header', function () {
      const r = new Response('I work out')
      assert.strictEqual(r.headers.get('content-type'), 'text/plain;charset=UTF-8')
    })

    featureDependent(
      test,
      support.blob,
      'construct with Blob body and type sets Content-Type header',
      function () {
        const r = new Response(new Blob(['test'], { type: 'text/plain' }))
        assert.strictEqual(r.headers.get('content-type'), 'text/plain')
      }
    )

    test('construct with body and explicit header uses header', function () {
      const r = new Response('I work out', {
        headers: {
          'Content-Type': 'text/plain',
        },
      })

      assert.strictEqual(r.headers.get('content-type'), 'text/plain')
    })

    test('construct with undefined statusText', function () {
      const r = new Response('', { statusText: undefined })
      assert.strictEqual(r.statusText, '')
    })

    test('construct with null statusText', function () {
      const r = new Response('', { statusText: null })
      assert.strictEqual(r.statusText, 'null')
    })

    test('init object as first argument', function () {
      const r = new Response({
        status: 201,
        headers: {
          'Content-Type': 'text/html',
        },
      })

      assert.strictEqual(r.status, 200)
      assert.strictEqual(r.headers.get('content-type'), 'text/plain;charset=UTF-8')
      return r.text().then(function (bodyText) {
        assert.strictEqual(bodyText, '[object Object]')
      })
    })

    test('null as first argument', function () {
      const r = new Response(null)

      assert.strictEqual(r.headers.get('content-type'), null)
      return r.text().then(function (bodyText) {
        assert.strictEqual(bodyText, '')
      })
    })
  })

  // https://fetch.spec.whatwg.org/#body-mixin
  describe('Body mixin', function () {
    featureDependent(describe, support.blob, 'arrayBuffer', function () {
      test('resolves arrayBuffer promise', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            return response.arrayBuffer()
          })
          .then(function (buf) {
            assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
            assert.strictEqual(buf.byteLength, 2)
          })
      })

      test('arrayBuffer handles binary data', function () {
        return fetch(`${baseUrl}/binary`)
          .then(function (response) {
            return response.arrayBuffer()
          })
          .then(function (buf) {
            assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
            assert.strictEqual(buf.byteLength, 256, 'buf.byteLength is correct')
            const view = new Uint8Array(buf)
            for (let i = 0; i < 256; i++) {
              assert.strictEqual(view[i], i)
            }
          })
      })

      test('arrayBuffer handles utf-8 data', function () {
        return fetch(`${baseUrl}/hello/utf8`)
          .then(function (response) {
            return response.arrayBuffer()
          })
          .then(function (buf) {
            assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
            assert.strictEqual(buf.byteLength, 5, 'buf.byteLength is correct')
            const octets = Array.prototype.slice.call(new Uint8Array(buf))
            assert.deepStrictEqual(octets, [104, 101, 108, 108, 111])
          })
      })

      test('arrayBuffer handles utf-16le data', function () {
        return fetch(`${baseUrl}/hello/utf16le`)
          .then(function (response) {
            return response.arrayBuffer()
          })
          .then(function (buf) {
            assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
            assert.strictEqual(buf.byteLength, 10, 'buf.byteLength is correct')
            const octets = Array.prototype.slice.call(new Uint8Array(buf))
            assert.deepStrictEqual(octets, [104, 0, 101, 0, 108, 0, 108, 0, 111, 0])
          })
      })

      test('rejects arrayBuffer promise after body is consumed', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            assert.strictEqual(response.bodyUsed, false)
            response.blob()
            assert.strictEqual(response.bodyUsed, true)
            return response.arrayBuffer()
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Promise rejected after body consumed')
          })
      })
    })

    featureDependent(describe, support.blob, 'blob', function () {
      test('resolves blob promise', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            return response.blob()
          })
          .then(function (blob) {
            assert(blob instanceof Blob, 'blob is a Blob instance')
            assert.strictEqual(blob.size, 2)
          })
      })

      test('blob handles binary data', function () {
        return fetch(`${baseUrl}/binary`)
          .then(function (response) {
            return response.blob()
          })
          .then(function (blob) {
            assert(blob instanceof Blob, 'blob is a Blob instance')
            assert.strictEqual(blob.size, 256, 'blob.size is correct')
          })
      })

      test('blob handles utf-8 data', function () {
        return fetch(`${baseUrl}/hello/utf8`)
          .then(function (response) {
            return response.blob()
          })
          .then(readBlobAsBytes)
          .then(function (octets) {
            assert.strictEqual(octets.length, 5, 'blob.size is correct')
            assert.deepStrictEqual(octets, [104, 101, 108, 108, 111])
          })
      })

      test('blob handles utf-16le data', function () {
        return fetch(`${baseUrl}/hello/utf16le`)
          .then(function (response) {
            return response.blob()
          })
          .then(readBlobAsBytes)
          .then(function (octets) {
            assert.strictEqual(octets.length, 10, 'blob.size is correct')
            assert.deepStrictEqual(octets, [104, 0, 101, 0, 108, 0, 108, 0, 111, 0])
          })
      })

      test('rejects blob promise after body is consumed', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            assert(response.blob, 'Body does not implement blob')
            assert.strictEqual(response.bodyUsed, false)
            response.text()
            assert.strictEqual(response.bodyUsed, true)
            return response.blob()
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Promise rejected after body consumed')
          })
      })
    })

    featureDependent(describe, support.formData, 'formData', function () {
      test('post sets content-type header', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'post',
          body: new FormData(),
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            assert.strictEqual(json.method, 'POST')
            assert(/^multipart\/form-data;/.test(json.headers['content-type']))
          })
      })

      featureDependent(
        test,
        !nativeChrome && !nativeEdge,
        'formData rejects after body was consumed',
        function () {
          return fetch(`${baseUrl}/json`)
            .then(function (response) {
              assert(response.formData, 'Body does not implement formData')
              response.formData()
              return response.formData()
            })
            .catch(function (error) {
              if (error instanceof assert.AssertionError) {
                throw error
              } else {
                assert(error instanceof TypeError, 'Promise rejected after body consumed')
              }
            })
        }
      )

      featureDependent(
        test,
        !nativeChrome && !nativeSafari && !nativeEdge,
        'parses form encoded response',
        function () {
          return fetch(`${baseUrl}/form`)
            .then(function (response) {
              return response.formData()
            })
            .then(function (form) {
              assert(form instanceof FormData, 'Parsed a FormData object')
            })
        }
      )
    })

    describe('json', function () {
      test('parses json response', function () {
        return fetch(`${baseUrl}/json`)
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            assert.strictEqual(json.name, 'Hubot')
            assert.strictEqual(json.login, 'hubot')
          })
      })

      test('rejects json promise after body is consumed', function () {
        return fetch(`${baseUrl}/json`)
          .then(function (response) {
            assert(response.json, 'Body does not implement json')
            assert.strictEqual(response.bodyUsed, false)
            response.text()
            assert.strictEqual(response.bodyUsed, true)
            return response.json()
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Promise rejected after body consumed')
          })
      })

      featureDependent(test, !polyfillFirefox, 'handles json parse error', function () {
        return fetch(`${baseUrl}/json-error`)
          .then(function (response) {
            return response.json()
          })
          .catch(function (error) {
            if (!IEorEdge) assert(error instanceof Error, 'JSON exception is an Error instance')
            assert(error.message, 'JSON exception has an error message')
          })
      })
    })

    describe('text', function () {
      test('handles 204 No Content response', function () {
        return fetch(`${baseUrl}/empty`)
          .then(function (response) {
            assert.strictEqual(response.status, 204)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, '')
          })
      })

      test('resolves text promise', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            return response.text()
          })
          .then(function (text) {
            assert.strictEqual(text, 'hi')
          })
      })

      test('rejects text promise after body is consumed', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            assert(response.text, 'Body does not implement text')
            assert.strictEqual(response.bodyUsed, false)
            response.text()
            assert.strictEqual(response.bodyUsed, true)
            return response.text()
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Promise rejected after body consumed')
          })
      })
    })
  })

  describe('fetch method', function () {
    describe('promise resolution', function () {
      test('resolves promise on 500 error', function () {
        return fetch(`${baseUrl}/boom`)
          .then(function (response) {
            assert.strictEqual(response.status, 500)
            assert.strictEqual(response.ok, false)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'boom')
          })
      })

      test.skip('rejects promise for network error', function () {
        return fetch(`${baseUrl}/error`)
          .then(function (response) {
            assert(false, 'HTTP status ' + response.status + ' was treated as success')
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Rejected with Error')
          })
      })

      test('rejects when Request constructor throws', function () {
        return fetch(`${baseUrl}/request`, { method: 'GET', body: 'invalid' })
          .then(function () {
            assert(false, 'Invalid Request init was accepted')
          })
          .catch(function (error) {
            assert(error instanceof TypeError, 'Rejected with Error')
          })
      })
    })

    describe('request', function () {
      test('sends headers', function () {
        return fetch(`${baseUrl}/request`, {
          headers: {
            Accept: 'application/json',
            'X-Test': '42',
          },
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            assert.strictEqual(json.headers.accept, 'application/json')
            assert.strictEqual(json.headers['x-test'], '42')
          })
      })

      test('with Request as argument', function () {
        const request = new Request(`${baseUrl}/request`, {
          headers: {
            Accept: 'application/json',
            'X-Test': '42',
          },
        })

        return fetch(request)
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            assert.strictEqual(json.headers.accept, 'application/json')
            assert.strictEqual(json.headers['x-test'], '42')
          })
      })

      test('reusing same Request multiple times', function () {
        const request = new Request(`${baseUrl}/request`, {
          headers: {
            Accept: 'application/json',
            'X-Test': '42',
          },
        })

        const responses = []

        return fetch(request)
          .then(function (response) {
            responses.push(response)
            return fetch(request)
          })
          .then(function (response) {
            responses.push(response)
            return fetch(request)
          })
          .then(function (response) {
            responses.push(response)
            return Promise.all(
              responses.map(function (r) {
                return r.json()
              })
            )
          })
          .then(function (jsons) {
            jsons.forEach(function (json) {
              assert.strictEqual(json.headers.accept, 'application/json')
              assert.strictEqual(json.headers['x-test'], '42')
            })
          })
      })

      featureDependent(describe, support.arrayBuffer, 'ArrayBuffer', function () {
        test('ArrayBuffer body', function () {
          return fetch(`${baseUrl}/request`, {
            method: 'post',
            body: arrayBufferFromText('name=Hubot'),
          })
            .then(function (response) {
              return response.json()
            })
            .then(function (request) {
              assert.strictEqual(request.method, 'POST')
              assert.strictEqual(request.data, 'name=Hubot')
            })
        })

        test('DataView body', function () {
          return fetch(`${baseUrl}/request`, {
            method: 'post',
            body: new DataView(arrayBufferFromText('name=Hubot')),
          })
            .then(function (response) {
              return response.json()
            })
            .then(function (request) {
              assert.strictEqual(request.method, 'POST')
              assert.strictEqual(request.data, 'name=Hubot')
            })
        })

        test('TypedArray body', function () {
          return fetch(`${baseUrl}/request`, {
            method: 'post',
            body: new Uint8Array(arrayBufferFromText('name=Hubot')),
          })
            .then(function (response) {
              return response.json()
            })
            .then(function (request) {
              assert.strictEqual(request.method, 'POST')
              assert.strictEqual(request.data, 'name=Hubot')
            })
        })
      })

      featureDependent(test, !IEorEdge, 'sends URLSearchParams body', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'post',
          body: new URLSearchParams('a=1&b=2'),
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'POST')
            assert.strictEqual(request.data, 'a=1&b=2')
          })
      })
    })

    featureDependent(describe, support.aborting, 'aborting', function () {
      test.skip('Request init creates an AbortSignal without option', function () {
        const request = new Request(`${baseUrl}/request`)
        assert.ok(request.signal)
        assert.strictEqual(request.signal.aborted, false)
      })

      test('Request init passes AbortSignal from option', function () {
        const controller = new AbortController()
        const request = new Request(`${baseUrl}/request`, { signal: controller.signal })
        assert.ok(request.signal)
        assert.deepStrictEqual(controller.signal, request.signal)
      })

      test('initially aborted signal', function () {
        const controller = new AbortController()
        controller.abort()

        return fetch(`${baseUrl}/request`, {
          signal: controller.signal,
        }).then(
          function () {
            assert.ok(false)
          },
          function (error) {
            if (!IEorEdge) assert(error instanceof DOMException)
            assert.strictEqual(error.name, 'AbortError')
          }
        )
      })

      test('initially aborted signal within Request', function () {
        const controller = new AbortController()
        controller.abort()

        const request = new Request(`${baseUrl}/request`, { signal: controller.signal })

        return fetch(request).then(
          function () {
            assert.ok(false)
          },
          function (error) {
            assert.strictEqual(error.name, 'AbortError')
          }
        )
      })

      test('mid-request', function () {
        const controller = new AbortController()

        setTimeout(function () {
          controller.abort()
        }, 30)

        return fetch(`${baseUrl}/slow?_=${new Date().getTime()}`, {
          signal: controller.signal,
        }).then(
          function () {
            assert.ok(false)
          },
          function (error) {
            assert.strictEqual(error.name, 'AbortError')
          }
        )
      })

      test('mid-request within Request', function () {
        const controller = new AbortController()
        const request = new Request(`${baseUrl}/slow?_=${new Date().getTime()}`, {
          signal: controller.signal,
        })

        setTimeout(function () {
          controller.abort()
        }, 30)

        return fetch(request).then(
          function () {
            assert.ok(false)
          },
          function (error) {
            assert.strictEqual(error.name, 'AbortError')
          }
        )
      })

      test('abort multiple with same signal', function () {
        const controller = new AbortController()

        setTimeout(function () {
          controller.abort()
        }, 30)

        return Promise.all([
          fetch(`${baseUrl}/slow?_=${new Date().getTime()}`, {
            signal: controller.signal,
          }).then(
            function () {
              assert.ok(false)
            },
            function (error) {
              assert.strictEqual(error.name, 'AbortError')
            }
          ),
          fetch(`${baseUrl}/slow?_=${new Date().getTime()}`, {
            signal: controller.signal,
          }).then(
            function () {
              assert.ok(false)
            },
            function (error) {
              assert.strictEqual(error.name, 'AbortError')
            }
          ),
        ])
      })
    })

    describe('response', function () {
      test('populates body', function () {
        return fetch(`${baseUrl}/hello`)
          .then(function (response) {
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.ok, true)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'hi')
          })
      })

      test.skip('parses headers', function () {
        return fetch(`${baseUrl}/headers?${new Date().getTime()}`).then(function (response) {
          assert.strictEqual(response.headers.get('Date'), 'Mon, 13 Oct 2014 21:02:27 GMT')
          assert.strictEqual(response.headers.get('Content-Type'), 'text/html; charset=utf-8')
        })
      })
    })

    // https://fetch.spec.whatwg.org/#methods
    describe('HTTP methods', function () {
      test('supports HTTP GET', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'get',
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'GET')
            assert.strictEqual(request.data, '')
          })
      })

      test('GET with body throws TypeError', function () {
        assert.throws(function () {
          new Request('', {
            method: 'get',
            body: 'invalid',
          })
        }, TypeError)
      })

      test('HEAD with body throws TypeError', function () {
        assert.throws(function () {
          new Request('', {
            method: 'head',
            body: 'invalid',
          })
        }, TypeError)
      })

      test('supports HTTP POST', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'post',
          body: 'name=Hubot',
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'POST')
            assert.strictEqual(request.data, 'name=Hubot')
          })
      })

      test('supports HTTP PUT', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'put',
          body: 'name=Hubot',
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'PUT')
            assert.strictEqual(request.data, 'name=Hubot')
          })
      })

      test('supports HTTP PATCH', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'PATCH',
          body: 'name=Hubot',
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'PATCH')
            assert.strictEqual(request.data, 'name=Hubot')
          })
      })

      test('supports HTTP DELETE', function () {
        return fetch(`${baseUrl}/request`, {
          method: 'delete',
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (request) {
            assert.strictEqual(request.method, 'DELETE')
            assert.strictEqual(request.data, '')
          })
      })
    })

    // https://fetch.spec.whatwg.org/#atomic-http-redirect-handling
    describe('Atomic HTTP redirect handling', function () {
      test('handles 301 redirect response', function () {
        return fetch(`${baseUrl}/redirect/301`)
          .then(function (response) {
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.ok, true)
            assert.match(response.url, /\/hello/)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'hi')
          })
      })

      test('handles 302 redirect response', function () {
        return fetch(`${baseUrl}/redirect/302`)
          .then(function (response) {
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.ok, true)
            assert.match(response.url, /\/hello/)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'hi')
          })
      })

      test('handles 303 redirect response', function () {
        return fetch(`${baseUrl}/redirect/303`)
          .then(function (response) {
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.ok, true)
            assert.match(response.url, /\/hello/)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'hi')
          })
      })

      test('handles 307 redirect response', function () {
        return fetch(`${baseUrl}/redirect/307`)
          .then(function (response) {
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.ok, true)
            assert.match(response.url, /\/hello/)
            return response.text()
          })
          .then(function (body) {
            assert.strictEqual(body, 'hi')
          })
      })

      featureDependent(
        test,
        support.permanentRedirect,
        'handles 308 redirect response',
        function () {
          return fetch(`${baseUrl}/redirect/308`)
            .then(function (response) {
              assert.strictEqual(response.status, 200)
              assert.strictEqual(response.ok, true)
              assert.match(response.url, /\/hello/)
              return response.text()
            })
            .then(function (body) {
              assert.strictEqual(body, 'hi')
            })
        }
      )
    })

    // https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    describe('credentials mode', function () {
      beforeEach(function () {
        return fetch(`${baseUrl}/cookie?name=foo&value=reset`, { credentials: 'same-origin' })
      })

      describe('omit', function () {
        test.skip('does not accept cookies with omit credentials', function () {
          return fetch(`${baseUrl}/cookie?name=foo&value=bar`, { credentials: 'omit' })
            .then(function () {
              return fetch(`${baseUrl}/cookie?name=foo`, { credentials: 'same-origin' })
            })
            .then(function (response) {
              return response.text()
            })
            .then(function (data) {
              assert.strictEqual(data, 'reset')
            })
        })

        test('does not send cookies with omit credentials', function () {
          return fetch(`${baseUrl}/cookie?name=foo&value=bar`)
            .then(function () {
              return fetch(`${baseUrl}/cookie?name=foo`, { credentials: 'omit' })
            })
            .then(function (response) {
              return response.text()
            })
            .then(function (data) {
              assert.strictEqual(data, '')
            })
        })
      })

      describe('same-origin', function () {
        test.skip('send cookies with same-origin credentials', function () {
          return fetch(`${baseUrl}/cookie?name=foo&value=bar`, { credentials: 'same-origin' })
            .then(function () {
              return fetch(`${baseUrl}/cookie?name=foo`, { credentials: 'same-origin' })
            })
            .then(function (response) {
              return response.text()
            })
            .then(function (data) {
              assert.strictEqual(data, 'bar')
            })
        })
      })

      describe('include', function () {
        test('send cookies with include credentials', function () {
          return fetch(`${baseUrl}/cookie?name=foo&value=bar`, { credentials: 'include' })
            .then(function () {
              return fetch(`${baseUrl}/cookie?name=foo`, { credentials: 'include' })
            })
            .then(function (response) {
              return response.text()
            })
            .then(function (data) {
              assert.strictEqual(data, 'bar')
            })
        })
      })
    })
  })
})
