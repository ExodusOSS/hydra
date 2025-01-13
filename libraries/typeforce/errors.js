const native = require('./native')

function getTypeName(fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/u)[1]
}

function getValueTypeName(value) {
  return native.Nil(value) ? '' : getTypeName(value.constructor)
}

function getValue(value) {
  if (native.Function(value)) return ''
  if (native.String(value)) return JSON.stringify(value)
  if (value && native.Object(value)) return ''
  return value
}

function captureStackTrace(e, t) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t)
  }
}

function tfJSON(type) {
  if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type)
  if (native.Array(type)) return 'Array'
  if (type && native.Object(type)) return 'Object'

  return type === undefined ? '' : type
}

function tfErrorString(type, value, valueTypeName) {
  const valueJson = getValue(value)

  return (
    'Expected ' +
    tfJSON(type) +
    ', got' +
    (valueTypeName === '' ? '' : ' ' + valueTypeName) +
    (valueJson === '' ? '' : ' ' + valueJson)
  )
}

class TfTypeError extends Error {
  constructor(type, value, valueTypeName) {
    valueTypeName = valueTypeName || getValueTypeName(value)
    super(tfErrorString(type, value, valueTypeName))

    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
  }
}

function tfPropertyErrorString(type, label, name, value, valueTypeName) {
  let description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString(
    'property "' + tfJSON(name) + description + tfJSON(type),
    value,
    valueTypeName
  )
}

class TfPropertyTypeError extends Error {
  constructor(type, property, label, value, valueTypeName) {
    let message
    if (type) {
      valueTypeName = valueTypeName || getValueTypeName(value)
      message = tfPropertyErrorString(type, label, property, value, valueTypeName)
    } else {
      message = 'Unexpected property "' + property + '"'
    }

    super(message)
    this.__label = label
    this.__property = property
    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
  }
}

function tfCustomError(expected, actual) {
  return new TfTypeError(expected, {}, actual)
}

function tfSubError(e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property

    e = new TfPropertyTypeError(e.__type, property, e.__label, e.__value, e.__valueTypeName)

    // child?
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(e.__type, property, label, e.__value, e.__valueTypeName)
  }

  captureStackTrace(e)
  return e
}

module.exports = {
  TfTypeError,
  TfPropertyTypeError,
  tfCustomError,
  tfSubError,
  tfJSON,
  getValueTypeName,
}
