import { OPR_REG_MATCH } from '@config'
import { isArray, isUndefined, isObject, isNull } from '@lib/types.js'
export function handleSourceKeyValueByRules (sourcekeyValue, rules) {
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
    REG_EXP
  } = OPR_REG_MATCH
  const ruleKeys = Object.keys(rules)
  const rulekeysLen = ruleKeys.length
  let isSourceMatchRule = true
  if (rulekeysLen === 0) return false
  for (let i = 0; i < rulekeysLen; i++) {
    let ruleKey = ruleKeys[i] // 匹配的规则key
    let ruleValue = rules[ruleKey] // 匹配的规则条件
    // 删除delkey，因此处写法和逻辑有问题
    if (ruleKey.match(REG_LT)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_LT, ''), ruleValue, 'lt')
    } else if (ruleKey.match(REG_GT)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_GT, ''), ruleValue, 'gt')
    } else if (ruleKey.match(REG_LTE)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_LTE, ''), ruleValue, 'lte')
    } else if (ruleKey.match(REG_GTE)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_GTE, ''), ruleValue, 'gte')
    } else if (ruleKey.match(REG_NOTEQUAL)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_NOTEQUAL, ''), ruleValue, 'notEqual')
    } else if (ruleKey.match(REG_BETWEEN)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_BETWEEN, ''), ruleValue, 'btw')
    } else if (ruleKey.match(REG_EXP)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_EXP, ''), ruleValue, 'reg')
    } else if (ruleKey.match(REG_EQUAL_TYPE)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_EQUAL_TYPE, ''), ruleValue, 'etype')
    } else if (ruleKey.match(REG_NOTEQUAL_TYPE)) {
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.replace(REG_NOTEQUAL_TYPE, ''), ruleValue, 'netype')
    } else if (!ruleKey.match(/^\$/g) || ruleKey.match(REG_EQUAL)) {
      // 当匹配$=符号或者没有符号，规则条件是数组则数组内的值任意满足源字段的值即可
      isSourceMatchRule = isSourceMatchRule && handelMultiCondits(sourcekeyValue, ruleKey.match(REG_EQUAL) ? ruleKey.replace(REG_EQUAL, '') : ruleKey, ruleValue)
    }
  }
  return {
    sourcekeyValue,
    matched: isSourceMatchRule
  }
}
/**
   * 返回数组子元素中包含当前key值的所有子项
   * @param {array} arrGroup
   * @param {string} key
   * @returns {array}
   */
export function fetchOutKeyChild (arrGroup, key) {
  let resGroup = []
  resGroup.mutilRes = true // 表示选择出来了多组数据
  // arrGroup的所有key字段产生新集合
  arrGroup.map((group, index) => {
    if (isUndefined(group[key])) return
    resGroup.push(group[key])
  })
  return resGroup // [mutilRes: true,[],[]]
}

// 处理规则值是数组情况（数组内的值是或关系，多值匹配一个条件，满足即可）
// 多种类型值得对比，数组中有对比符合的子项即返回成功
function handelMultiCondits (sourcekeyValue, bareKey, ruleValue, mSymbol) {
  if (isArray(ruleValue) && mSymbol !== 'btw' && mSymbol !== 'reg') {
    let itemMatch = false
    ruleValue.map((conditItem) => {
      itemMatch = itemMatch || compareResult(sourcekeyValue, bareKey, conditItem, mSymbol)
    })
    return itemMatch
  } else {
    return compareResult(sourcekeyValue, bareKey, ruleValue, mSymbol)
  }
}
/**
  * 返回源数据和条件逐条比较的结果
  * @param {array | object} sourcekeyValue 路径匹配到的原数据集合
  * @param {string} bareKey 条件集合中的单条key
  * @param {*} value 条件集合中的单条value
  * @param {*} mSymbol 运算符
  * @returns {boolean}
  */
function compareResult (sourcekeyValue, bareKey, ruleValue, mSymbol) {
  const sourcePosValue = sourcekeyValue[bareKey]
  if (+sourcePosValue !== 0 && !sourcePosValue) return false
  const sourceValTypeIsArr = isArray(sourcePosValue)
  const valTypeIsStr = typeof sourcePosValue === 'string'
  const valTypeIsNum = typeof sourcePosValue === 'number'
  const compareType = mSymbol === 'netype' || mSymbol === 'etype'
  if (compareType) {
    // 类型校验
    // compareType ? ruleValue.toLowerCase() ... 规则类型字符串转换成小写统一
    return dispatchSymbolCompare(sourcePosValue, ruleValue.toLowerCase(), mSymbol)
  } else if (sourceValTypeIsArr || valTypeIsStr || valTypeIsNum) {
    // 支持数组的长度、数值和字符串值的对比，新增类型对比，不支持复杂类型值的深比较
    if (sourceValTypeIsArr && typeof ruleValue !== 'number') throw Error('Source Value Type Is Array, Match length ,Rule Condition Must Be Number')
    // sourceValTypeIsArr ? sourcePosValue.length : sourcePosValue 数组类型用长度，数字字符串用值
    return dispatchSymbolCompare(sourceValTypeIsArr ? sourcePosValue.length : sourcePosValue, ruleValue, mSymbol)
  } else {
    return false
  }
}
/**
   * 字段类型-字符串
   * @param {any} o
   * @returns
   */
function transTypeToString (o) {
  const typeofStr = typeof o // string、number、boolean、function、sysmbol
  if (typeofStr === 'object' || typeofStr === 'undefined') {
    if (isUndefined(o)) return 'undefined'
    if (isNull(o)) return 'null'
    if (isArray(o)) return 'array'
    if (isObject(o)) return 'object'
  } else {
    return typeofStr
  }
}
/**
   * 根据运算符进行比较计算
   * @param {string | number} x
   * @param {string | number} y
   * @param {string} mSymbol 运算符
   * @returns
   */
function dispatchSymbolCompare (x, y, mSymbol) {
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
      case 'btw': // y = [from,end]
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
