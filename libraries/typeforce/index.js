const ERRORS = require('./errors')
const NATIVE = require('./native')

// short-hand
const tfJSON = ERRORS.tfJSON
const TfTypeError = ERRORS.TfTypeError
const TfPropertyTypeError = ERRORS.TfPropertyTypeError
const tfSubError = ERRORS.tfSubError
const getValueTypeName = ERRORS.getValueTypeName

const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

const TYPES = {
  arrayOf: function arrayOf(type, options) {
    type = compile(type)
    options = options || {}

    function _arrayOf(array, strict) {
      if (!NATIVE.Array(array)) return false
      if (NATIVE.Nil(array)) return false
      if (options.minLength !== undefined && array.length < options.minLength) return false
      if (options.maxLength !== undefined && array.length > options.maxLength) return false
      if (options.length !== undefined && array.length !== options.length) return false

      return array.every(function (value, i) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }

    _arrayOf.toJSON = function () {
      let str = '[' + tfJSON(type) + ']'
      if (options.length !== undefined) {
        str += '{' + options.length + '}'
      } else if (options.minLength !== undefined || options.maxLength !== undefined) {
        str +=
          '{' +
          (options.minLength === undefined ? 0 : options.minLength) +
          ',' +
          (options.maxLength === undefined ? Infinity : options.maxLength) +
          '}'
      }

      return str
    }

    return _arrayOf
  },

  maybe: function maybe(type) {
    type = compile(type)

    function _maybe(value, strict) {
      return NATIVE.Nil(value) || type(value, strict, maybe)
    }

    _maybe.toJSON = function () {
      return '?' + tfJSON(type)
    }

    return _maybe
  },

  map: function map(propertyType, propertyKeyType) {
    propertyType = compile(propertyType)
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType)

    function _map(value, strict) {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      for (const propertyName in value) {
        try {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict)
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key')
        }

        try {
          const propertyValue = value[propertyName]
          typeforce(propertyType, propertyValue, strict)
        } catch (e) {
          throw tfSubError(e, propertyName)
        }
      }

      return true
    }

    if (propertyKeyType) {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
      }
    } else {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyType) + '}'
      }
    }

    return _map
  },

  object: function object(uncompiled) {
    const type = {}

    for (const typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName])
    }

    function _object(value, strict) {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      let propertyName

      try {
        for (propertyName in type) {
          const propertyType = type[propertyName]
          const propertyValue = value[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        throw tfSubError(e, propertyName)
      }

      if (strict) {
        for (propertyName in value) {
          if (hasOwn(type, propertyName) && type[propertyName]) continue

          throw new TfPropertyTypeError(undefined, propertyName)
        }
      }

      return true
    }

    _object.toJSON = function () {
      return tfJSON(type)
    }

    return _object
  },

  anyOf: function anyOf() {
    const types = Array.prototype.slice.call(arguments).map(compile)

    function _anyOf(value, strict) {
      return types.some(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch {
          return false
        }
      })
    }

    _anyOf.toJSON = function () {
      return types.map(tfJSON).join('|')
    }

    return _anyOf
  },

  allOf: function allOf() {
    const types = Array.prototype.slice.call(arguments).map(compile)

    function _allOf(value, strict) {
      return types.every(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch {
          return false
        }
      })
    }

    _allOf.toJSON = function () {
      return types.map(tfJSON).join(' & ')
    }

    return _allOf
  },

  quacksLike: function quacksLike(type) {
    function _quacksLike(value) {
      return type === getValueTypeName(value)
    }

    _quacksLike.toJSON = function () {
      return type
    }

    return _quacksLike
  },

  tuple: function tuple() {
    const types = Array.prototype.slice.call(arguments).map(compile)

    function _tuple(values, strict) {
      if (NATIVE.Nil(values)) return false
      if (NATIVE.Nil(values.length)) return false
      if (strict && values.length !== types.length) return false

      return types.every(function (type, i) {
        try {
          return typeforce(type, values[i], strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }

    _tuple.toJSON = function () {
      return '(' + types.map(tfJSON).join(', ') + ')'
    }

    return _tuple
  },

  value: function value(expected) {
    function _value(actual) {
      return actual === expected
    }

    _value.toJSON = function () {
      return expected
    }

    return _value
  },
}

// TODO: deprecate
TYPES.oneOf = TYPES.anyOf

function compile(type) {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1))

    return NATIVE[type] || TYPES.quacksLike(type)
  }

  if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) {
      if (type.length !== 1)
        throw new TypeError('Expected compile() parameter of type Array of length 1')
      return TYPES.arrayOf(type[0])
    }

    return TYPES.object(type)
  }

  if (NATIVE.Function(type)) {
    return type
  }

  return TYPES.value(type)
}

function typeforce(type, value, strict, surrogate) {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true

    throw new TfTypeError(surrogate || type, value)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign types to typeforce function
for (const typeName in NATIVE) {
  typeforce[typeName] = NATIVE[typeName]
}

for (const typeName in TYPES) {
  typeforce[typeName] = TYPES[typeName]
}

const EXTRA = require('./extra')
for (const typeName in EXTRA) {
  typeforce[typeName] = EXTRA[typeName]
}

typeforce.compile = compile
typeforce.parse = (type, value, strict, surrogate) => {
  if (strict === false) throw new Error('parse() is always strict')
  if (typeforce(type, value, true, surrogate)) return value

  throw new Error('failed to parse') // should be unreachable
}

typeforce.TfTypeError = TfTypeError
typeforce.TfPropertyTypeError = TfPropertyTypeError

module.exports = typeforce
