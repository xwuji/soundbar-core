/**
 * Types zhangxiao774
 * 2018-11-07
 */

function getType (o) {
  return Object.prototype.toString.call(o)
}
function polyFillObjectKeys () {
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty

      var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString')

      var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ]

      var dontEnumsLength = dontEnums.length
      return function (obj) {
        if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null) throw new TypeError('Object.keys called on non-object')
        var result = []
        for (var prop in obj) {
          if (hasOwnProperty.call(obj, prop)) result.push(prop)
        }
        if (hasDontEnumBug) {
          for (var i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
          }
        }
        return result
      }
    })()
  }
}

module.exports = {
  isStr (o) {
    return typeof o === 'string'
  },
  isNum (o) {
    return typeof o === 'number'
  },
  isBoolean (o) {
    return typeof o === 'boolean'
  },
  isFunction (o) {
    return typeof o === 'function'
  },
  isArray (o) {
    if (Array.isArray) {
      return Array.isArray(o)
    } else {
      return getType(o) === '[object Array]'
    }
  },
  isObject (o) {
    return getType(o) === '[object Object]'
  },
  isNull (o) {
    return getType(o) === '[object Null]'
  },
  isUndefined (o) {
    return getType(o) === '[object Undefined]'
  },
  isEmptyObj (o) {
    if (!this.isObject(o)) throw new Error('Not an Object')
    polyFillObjectKeys()
    return Object.keys(o).length === 0
  },
  /**
   * 对象深比较
   * @param {*} x
   * @param {*} y
   * @returns {Boolean}
   */
  deepCompare (x, y) {
    var i, l, leftChain, rightChain
    function compare2Objects (x, y) {
      var p
      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true
      }
      // Compare primitives and functions.
      // Check if both arguments link to the same object.
      // Especially useful on the step where we compare prototypes
      if (x === y) {
        return true
      }
      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString()
      }
      // At last checking prototypes as good as we can
      if (!(x instanceof Object && y instanceof Object)) {
        return false
      }
      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false
      }
      if (x.constructor !== y.constructor) {
        return false
      }
      if (x.prototype !== y.prototype) {
        return false
      }
      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false
      }
      // Quick checking of one object being a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false
        } else if (typeof y[p] !== typeof x[p]) {
          return false
        }
      }
      for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false
        } else if (typeof y[p] !== typeof x[p]) {
          return false
        }
        switch (typeof (x[p])) {
          case 'object':
          case 'function':
            leftChain.push(x)
            rightChain.push(y)
            if (!compare2Objects(x[p], y[p])) {
              return false
            }
            leftChain.pop()
            rightChain.pop()
            break
          default:
            if (x[p] !== y[p]) {
              return false
            }
            break
        }
      }
      return true
    }
    if (arguments.length < 1) {
      return true // Die silently? Don't know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }
    for (i = 1, l = arguments.length; i < l; i++) {
      leftChain = [] // Todo: this can be cached
      rightChain = []

      if (!compare2Objects(arguments[0], arguments[i])) {
        return false
      }
    }
    return true
  }
}
