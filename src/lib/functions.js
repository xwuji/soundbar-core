import OPR_REG_MATCH from '@config'
import { isArray, isUndefined, isObject, isNull } from '@lib/types.js'
export default{
  handleSourceKeyValueByRules (sourcekeyValue, rules) {
    const {
      REG_LT,
      REG_GT,
      REG_LTE,
      REG_GTE,
      REG_EQUAL,
      REG_NOTEQUAL,
      REG_BETWEEN,
      REG_EQUAL_TYPE,
      REG_NOTEQUAL_TYPE,
      REG_EXP,
      REG_DEL
    } = OPR_REG_MATCH
    const ruleKeys = Object.keys(rules)
    const ckeysLen = ruleKeys.length
    const { compareResult } = this
    let isSourceMatchRule = true
    if (ckeysLen === 0) return false
    for (let i = 0; i < ckeysLen; i++) {
      let ruleKey = ruleKeys[i] // 匹配的规则key
      let ruleValue = rules[ruleKey] // 匹配的规则条件
      if (ruleKey.match(REG_DEL)) {
        const deleteKeys = ruleKey.replace(REG_DEL, '')
        if (isObject(sourcekeyValue) && sourcekeyValue.hasOwnProperty(deleteKeys)) delete sourcekeyValue[deleteKeys]
      } else if (ruleKey.match(REG_LT)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_LT, ''), ruleValue, 'lt')
      } else if (ruleKey.match(REG_GT)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_GT, ''), ruleValue, 'gt')
      } else if (ruleKey.match(REG_LTE)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_LTE, ''), ruleValue, 'lte')
      } else if (ruleKey.match(REG_GTE)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_GTE, ''), ruleValue, 'gte')
      } else if (ruleKey.match(REG_NOTEQUAL)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_NOTEQUAL, ''), ruleValue, 'notEqual')
      } else if (ruleKey.match(REG_BETWEEN)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_BETWEEN, ''), ruleValue, 'bt')
      } else if (ruleKey.match(REG_EXP)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_EXP, ''), ruleValue, 'reg')
      } else if (ruleKey.match(REG_EQUAL_TYPE)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_EQUAL_TYPE, ''), ruleValue, 'etype')
      } else if (ruleKey.match(REG_NOTEQUAL_TYPE)) {
        isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, ruleKey.replace(REG_NOTEQUAL_TYPE, ''), ruleValue, 'netype')
      } else if (!ruleKey.match(/^\$/g) || ruleKey.match(REG_EQUAL)) {
        // 当匹配$=符号或者没有符号，规则条件是数组则数组内的值任意满足源字段的值即可
        const bareKey = ruleKey.match(REG_EQUAL) ? ruleKey.replace(REG_EQUAL, '') : ruleKey
        if (isArray(ruleValue)) {
          // 多种类型值得对比，数组中有对比符合的子项即返回成功
          let itemMatch = false
          ruleValue.map((conditItem) => {
            itemMatch = itemMatch || compareResult(sourcekeyValue, bareKey, conditItem)
          })
          isSourceMatchRule = isSourceMatchRule && itemMatch
        } else {
          isSourceMatchRule = isSourceMatchRule && compareResult(sourcekeyValue, bareKey, ruleValue)
        }
      }
    }
    return {
      sourcekeyValue,
      matched: isSourceMatchRule
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
  * 返回源数据和条件逐条比较的结果
  * @param {array | object} sourcekeyValue 路径匹配到的原数据集合
  * @param {string} bareKey 条件集合中的单条key
  * @param {*} value 条件集合中的单条value
  * @param {*} mSymbol 运算符
  * @returns {boolean}
  */
  compareResult (sourcekeyValue, bareKey, ruleValue, mSymbol) {
    const { dispatchSymbolCompare } = this
    const sourcePosValue = sourcekeyValue[bareKey]
    if (!sourcePosValue) return false
    const sourceValTypeIsArr = isArray(sourcePosValue)
    const valTypeIsStr = typeof sourcePosValue === 'string'
    const valTypeIsNum = typeof sourcePosValue === 'number'
    const compareType = mSymbol === 'netype' || mSymbol === 'etype'
    // 支持数组的长度、数值和字符串值的对比，新增类型对比，不支持复杂类型值的深比较
    if (sourceValTypeIsArr || valTypeIsStr || valTypeIsNum) {
      // !compareType && ... 类型的比较不适用下面的抛错
      // compareType ? ruleValue.toLowerCase() ... 规则类型字符串转换成小写统一
      // sourceValTypeIsArr ? sourcePosValue.length : sourcePosValue 数组类型用长度，数字字符串用值
      if (!compareType && sourceValTypeIsArr && typeof ruleValue !== 'number') throw Error('Source Value Type Is Array, Match length ,Rule Condition Must Be Number')
      return dispatchSymbolCompare(sourceValTypeIsArr ? sourcePosValue.length : sourcePosValue, compareType ? ruleValue.toLowerCase() : ruleValue, mSymbol)
    } else {
      return false
    }
  },
  /**
   * 字段类型-字符串
   * @param {any} o
   * @returns
   */
  transTypeToString (o) {
    const typeofStr = typeof o // string、number、boolean、function、sysmbol
    if (typeofStr === 'object' || typeofStr === 'undefined') {
      if (isUndefined(o)) return 'undefined'
      if (isNull(o)) return 'null'
      if (isArray(o)) return 'array'
      if (isObject(o)) return 'object'
    } else {
      return typeofStr
    }
  },
  /**
   * 根据运算符进行比较计算
   * @param {string | number} x
   * @param {string | number} y
   * @param {string} mSymbol 运算符
   * @returns
   */
  dispatchSymbolCompare (x, y, mSymbol) {
    const { transTypeToString } = this
    try {
      switch (mSymbol) {
        case 'lt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x < +y
        case 'gt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x > +y
        case 'lte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x <= +y
        case 'gte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return +x >= +y
        case 'notEqual':
          return x !== y
        case 'bt': // y = [from,end]
          if (Object.is(+x, NaN) || Object.is(+y[0], NaN) || Object.is(+y[1], NaN)) return false
          else return x > y[0] && x < y[1]
        case 'reg':
          const reg = new RegExp(y[0], y[1])
          return !!x.match(reg)
        case 'etype':
          return transTypeToString(x) === y
        case 'netype':
          return transTypeToString(x) !== y
        default:
          return x === y
      }
    } catch (error) {
      return false
    }
  }
}
