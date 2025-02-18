const errors = require('./errors')

const _generateId = () => {
  let id = 0
  return () => id++
}

const isValidId = (id) => {
  // See: https://www.jsonrpc.org/specification#request_object.
  return Number.isInteger(id) || typeof id === 'string' || id === null
}

class RPC {
  constructor({
    transport,
    requestTimeout = 20_000,
    generateId = _generateId,
    methods = new Map(),
    parse = JSON.parse,
    stringify = JSON.stringify,
    getIsDevelopmentMode = () => false,
  } = {}) {
    if (!transport) throw new Error('TRANSPORT_REQUIRED')
    this._transport = transport
    this._requestTimeout = requestTimeout
    this._pendingRequest = new Map()
    this._generateId = generateId()
    this._processResponse = this._processResponse.bind(this)
    this._methods = methods
    this.parse = parse
    this._stringify = stringify
    if (typeof getIsDevelopmentMode !== 'function')
      throw new Error('getIsDevelopmentMode must be a function')
    this._getIsDevelopmentMode = getIsDevelopmentMode
    transport.on('data', this._processResponse)
  }

  end() {
    this._transport.removeListener('data', this._processResponse)
  }

  exposeMethods(methods) {
    if (!(methods instanceof Map)) {
      methods = Object.entries(methods).reduce(
        (map, [name, impl]) => map.set(name, impl),
        new Map()
      )
    }

    const oldImpl = this._methods
    this._methods = methods
    return oldImpl
  }

  exposeFunction(name, implementation) {
    if (typeof name !== 'string') {
      throw new TypeError('Function name must be a string')
    }

    if (typeof implementation !== 'function') {
      throw new TypeError('Invalid function implementation')
    }

    this._methods.set(name, implementation)
  }

  async callMethod(method, params) {
    const id = this._generateId()
    const request = this._makeRequestObject({ method, params, id })
    return this._sendRequest({ request })
  }

  async callMethodWithRawResponse(method, params) {
    const id = this._generateId()
    const request = this._makeRequestObject({ method, params, id })
    return this._sendRequest({ request, getRawResponse: true })
  }

  async notify(method, params) {
    const request = this._makeRequestObject({ method, params })
    this._transport.write(this._stringify(request))
  }

  _sendRequest({ request, getRawResponse = false }) {
    const { id } = request
    const data = this._stringify(request)
    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        if (this._pendingRequest.has(id)) {
          this._pendingRequest.delete(id)
          reject(new Error(`JSON-RPC: method call timeout calling ${request.method}`))
        }
      }, this._requestTimeout)
      this._pendingRequest.set(id, { resolve, reject, timeoutTimer, getRawResponse })
      ;(async () => {
        try {
          await this._transport.write(data)
        } catch (err) {
          clearTimeout(timeoutTimer)
          this._pendingRequest.delete(id)
          reject(err)
        }
      })()
    })
  }

  _processResponse(data) {
    let response
    try {
      response = this.parse(data)
    } catch (err) {
      const id = typeof data === 'string' ? JSON.parse(data).id : data.id
      if (!isValidId(id)) {
        throw err
      }

      const { message } = err
      this._sendError({ ...errors.INVALID_REQUEST, message }, id)
      return
    }

    const isRequest = Object.hasOwnProperty.call(response, 'method')
    if (isRequest) {
      return this._processCallMethod(response)
    }

    const isErrorResponse = Object.hasOwnProperty.call(response, 'error')
    const resolvers = this._pendingRequest.get(response.id)
    if (!resolvers) {
      return
    }

    this._pendingRequest.delete(response.id)
    clearTimeout(resolvers.timeoutTimer)
    if (resolvers.getRawResponse) {
      resolvers.resolve(response)
    } else if (isErrorResponse) {
      const errorObject = this._makeErrorObject(response.error)
      resolvers.reject(errorObject)
    } else {
      resolvers.resolve(response.result)
    }
  }

  async _processCallMethod(request) {
    const { method: methodName, params = [], id } = request
    const methodImplementation = this._methods.get(methodName)
    if (!methodImplementation) {
      this._sendError(
        {
          ...errors.METHOD_NOT_FOUND,
          methodName,
        },
        id
      )
    } else if (typeof methodImplementation === 'function') {
      // JSON-RPC allows to send "named parameters", where params is an object
      // In case params is not an array we pass it as a first parameter to method
      const paramsArray = Array.isArray(params) ? params : [params]

      try {
        const result = await Promise.resolve(methodImplementation.apply(this._methods, paramsArray))
        this._sendSuccess({
          result,
          id,
        })
      } catch (error) {
        this._sendError(error, id)
      }
    } else {
      this._sendError(errors.INTERNAL_ERROR, id)
    }
  }

  // https://www.jsonrpc.org/specification#error_object
  _sendError(error, id) {
    let {
      message = errors.INTERNAL_ERROR.message,
      code = errors.INTERNAL_ERROR.code,
      cause,
      stack,
      ...data
    } = error || {} // Just in case of "throw null" or "throw undefined"
    if (typeof error !== 'object') {
      data = error
    }

    if (error === null) {
      data = null
    }

    if (error instanceof Error && this._getIsDevelopmentMode()) {
      // Allow logging the stack trace & its cause
      data.cause = {
        message,
        stack,
        cause,
      }
    }

    const errorMessage = this._stringify({
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    })
    this._transport.write(errorMessage)
  }

  _sendSuccess({ result, id }) {
    const isNotify = id === undefined
    if (isNotify) {
      return
    }

    const data = this._stringify({
      jsonrpc: '2.0',
      id,
      result,
    })
    this._transport.write(data)
  }

  _makeRequestObject({ method, params, id }) {
    return {
      jsonrpc: '2.0',
      method,
      params,
      id,
    }
  }

  _createRecursiveError(error) {
    if (typeof error !== 'object' || error === null) {
      return null
    }

    let cause = null
    if (error.cause) {
      cause = this._createRecursiveError(error.cause)
    }

    const newError = new Error(error.message, { cause })
    newError.stack = error.stack
    return newError
  }

  _makeErrorObject(errorData) {
    const code = errorData.code
    const errorFromCode = errors[code]
    const message = errorData.message || (errorFromCode && errorFromCode.message)

    const error = new Error(message)

    error.code = code
    if (Object.hasOwnProperty.call(errorData, 'data')) {
      if (typeof errorData.data === 'object' && errorData.data !== null) {
        const { name, cause, hint, reason, ...data } = errorData.data
        error.name = name
        if (cause) {
          error.cause = this._createRecursiveError(cause)
        }

        if (reason) {
          error.reason = reason
        }

        if (hint) {
          error.hint = hint
        }

        error.data = data
      } else {
        error.data = errorData.data
      }
    }

    return error
  }
}

module.exports = RPC
