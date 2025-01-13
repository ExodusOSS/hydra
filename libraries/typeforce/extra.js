const NATIVE = require('./native')
const ERRORS = require('./errors')

function _Buffer(value) {
  return Buffer.isBuffer(value)
}

function Hex(value) {
  return typeof value === 'string' && /^([\da-f]{2})+$/iu.test(value)
}

function _LengthN(type, length) {
  const name = type.toJSON()

  function Length(value) {
    if (!type(value)) return false
    if (value.length === length) return true

    throw ERRORS.tfCustomError(
      name + '(Length: ' + length + ')',
      name + '(Length: ' + value.length + ')'
    )
  }

  Length.toJSON = function () {
    return name
  }

  return Length
}

const _ArrayN = _LengthN.bind(null, NATIVE.Array)
const _BufferN = _LengthN.bind(null, _Buffer)
const _HexN = _LengthN.bind(null, Hex)
const _StringN = _LengthN.bind(null, NATIVE.String)

function Range(a, b, f) {
  f = f || NATIVE.Number

  function _range(value, strict) {
    return f(value, strict) && value > a && value < b
  }

  _range.toJSON = function () {
    return `${f.toJSON()} between [${a}, ${b}]`
  }

  return _range
}

const INT53_MAX = Math.pow(2, 53) - 1

function Finite(value) {
  return typeof value === 'number' && isFinite(value)
}

function Int8(value) {
  return (value << 24) >> 24 === value
}

function Int16(value) {
  return (value << 16) >> 16 === value
}

function Int32(value) {
  return (value | 0) === value // eslint-disable-line unicorn/prefer-math-trunc
}

function Int53(value) {
  return (
    typeof value === 'number' &&
    value >= -INT53_MAX &&
    value <= INT53_MAX &&
    Math.floor(value) === value
  )
}

function UInt8(value) {
  return (value & 0xff) === value
}

function UInt16(value) {
  return (value & 0xff_ff) === value
}

function UInt32(value) {
  return value >>> 0 === value
}

function UInt53(value) {
  return (
    typeof value === 'number' && value >= 0 && value <= INT53_MAX && Math.floor(value) === value
  )
}

const types = {
  ArrayN: _ArrayN,
  Buffer: _Buffer,
  BufferN: _BufferN,
  Finite,
  Hex,
  HexN: _HexN,
  Int8,
  Int16,
  Int32,
  Int53,
  Range,
  StringN: _StringN,
  UInt8,
  UInt16,
  UInt32,
  UInt53,
}

for (const typeName in types) {
  types[typeName].toJSON = function (t) {
    return t
  }.bind(null, typeName)
}

module.exports = types
