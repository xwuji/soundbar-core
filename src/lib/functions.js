const { isArray, isUndefined, isObject } = require('../lib/types.js')
const { REGMATCH } = require('../config.js')
const functions = {
  sourceMatchConditions (sourceData, conditions) {
    const { REG_NOT, REG_LT, REG_LTE, REG_GT, REG_GTE, REG_NOTEQUAL, REG_BETWEEN, REG_EXP, REG_OR, REG_AND } = REGMATCH
    const ckeys = Object.keys(conditions)
    const ckeysLen = ckeys.length
    const deleteKeys = []
    const { compareResult } = this
    let matched = true
    if (ckeysLen === 0) return false
    for (let i = 0; i < ckeysLen; i++) {
      let ckey = ckeys[i] // 匹配的key
      let condit = conditions[ckey] // 匹配的conidtion
      if (ckey.match(REG_NOT)) {
        const deleteKey = ckey.replace(REG_NOT, '')
        deleteKeys.push = deleteKey
      } else if (ckey.match(REG_LT)) {
        const key = ckey.replace(REG_LT, '')
        const compareRes = compareResult(sourceData, key, condit, 'lt')
        matched = matched && compareRes
      } else if (ckey.match(REG_LTE)) {
        const key = ckey.replace(REG_LTE, '')
        const compareRes = compareResult(sourceData, key, condit, 'lte')
        matched = matched && compareRes
      } else if (ckey.match(REG_GT)) {
        const key = ckey.replace(REG_GT, '')
        const compareRes = compareResult(sourceData, key, condit, 'gt')
        matched = matched && compareRes
      } else if (ckey.match(REG_GTE)) {
        const key = ckey.replace(REG_GTE, '')
        const compareRes = compareResult(sourceData, key, condit, 'gte')
        matched = matched && compareRes
      } else if (ckey.match(REG_NOTEQUAL)) {
        const key = ckey.replace(REG_NOTEQUAL, '')
        const compareRes = compareResult(sourceData, key, condit, 'notEqual')
        matched = matched && compareRes
      } else if (ckey.match(REG_BETWEEN)) {
        const key = ckey.replace(REG_BETWEEN, '')
        const compareRes = compareResult(sourceData, key, condit, 'bt')
        matched = matched && compareRes
      } else if (ckey.match(REG_EXP)) {
        const key = ckey.replace(REG_EXP, '')
        const compareRes = compareResult(sourceData, key, condit, 'reg')
        matched = matched && compareRes
      } else if (!ckey.match(REG_OR)) {
        // and逻辑直接忽略符号，执行默认逻辑
        let key
        if (ckey.match(REG_AND)) {
          key = ckey.replace(REG_AND, '')
        } else {
          key = ckey
        }
        if (isArray(condit)) {
          // 多种类型值得对比，数组中有对比符合的子项即返回成功
          let itemMatch = false
          condit.map((conditItem) => {
            itemMatch = itemMatch || compareResult(sourceData, key, conditItem)
          })
          matched = matched && itemMatch
        } else {
          matched = matched && compareResult(sourceData, key, condit)
        }
      }
    }
    if (deleteKeys.length > 0) {
      deleteKeys.map((dk) => {
        if (isObject(sourceData) && sourceData.hasOwnProperty(dk)) delete sourceData[dk]
      })
    }
    return {
      sourceData,
      matched
    }
  },
  /**
   * 返回数组子元素中包含当前key值的所有子项
   * @param {array} arrGroup
   * @param {string} key
   * @returns {array}
   */
  fetchOutKeyChild (arrGroup, key) {
    let resGroup = []
    resGroup.mutilRes = true // 表示选择出来了多组数据
    // arrGroup的所有key字段产生新集合
    arrGroup.map((group, index) => {
      if (isUndefined(group[key])) return
      resGroup.push(group[key])
    })
    return resGroup // [mutilRes: true,[],[]]
  },
  /**
   * 根据运算符进行比较计算
   * @param {string | number} x
   * @param {string | number} y
   * @param {string} mSymbol 运算符
   * @returns
   */
  switchMathCompare (x, y, mSymbol) {
    try {
      switch (mSymbol) {
        case 'lt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x < +y
        case 'lte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x <= +y
        case 'gt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x > +y
        case 'gte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x >= +y
        case 'notEqual':
          return x !== y
        case 'bt':
          if (Object.is(+x, NaN) || Object.is(+y[0], NaN) || Object.is(+y[1], NaN)) return false
          else return x > y[0] && x < y[1]
        case 'reg':
          const reg = new RegExp(y[0], y[1])
          return !!x.match(reg)
        default:
          return x === y
      }
    } catch (error) {
      return false
    }
  },
  /**
  * 返回源数据和条件逐条比较的结果
  * @param {array | object} sourceData 路径匹配到的原数据集合
  * @param {string} key 条件集合中的单条key
  * @param {*} value 条件集合中的单条value
  * @param {*} mSymbol 运算符
  * @returns {boolean}
  */
  compareResult (sourceData, key, condit, mSymbol) {
    const { switchMathCompare } = this
    const sourcePosValue = sourceData[key]
    if (!sourcePosValue) return false
    // 条件对比支持数组的长度和数值和字符串
    if (isArray(sourcePosValue)) {
      if (typeof condit !== 'number') throw Error('Arrays condition value not a number')
      return switchMathCompare(sourcePosValue.length, condit, mSymbol)
    } else if (typeof sourcePosValue === 'string' || typeof sourcePosValue === 'number') {
      return switchMathCompare(sourcePosValue, condit, mSymbol)
    } else {
      return false
    }
  }
}
module.exports = functions
