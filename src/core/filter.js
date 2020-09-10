import { isArray, isObject } from '@lib/types.js'
import { handleSourceKeyValueByRules } from '@lib/functions.js'

export default class FilterCore {
  constructor (queryFilterRule, sourceBody) {
    this.queryFilterRule = queryFilterRule
    this.sourceBody = sourceBody
  }
  get getFilterGroup () {
    const { queryFilterRule, sourceBody } = this
    if (!sourceBody) return
    if (!queryFilterRule) return sourceBody
    let cpSouceBody = { ...sourceBody }
    let rulePathesArr = Object.keys(queryFilterRule)
    // 排序，越短层级越高，层级高的先处理
    rulePathesArr.sort((m, n) => {
      return m.length - n.length
    })
    // rulePathesArr => ["$.code","$.result.list","$.result.config","$.result.pageView","$.result.list.description"]
    const rulePathesArrLen = rulePathesArr.length
    for (let i = 0; i < rulePathesArrLen; i++) {
      let operatorData = cpSouceBody
      const filterPath = rulePathesArr[i] // "$.result.list"
      const conditions = queryFilterRule[filterPath] // {}
      const rulePathSplitArr = filterPath.split('.').splice(1)//  ['result','list']
      const rulePathSplitArrLen = rulePathSplitArr.length
      for (let i = 0; i < rulePathSplitArrLen; i++) {
        operatorData = operatorData[rulePathSplitArr[i]] // cpSouceBody['result']['list']
        if (isArray(operatorData) && (i === rulePathSplitArrLen - 1)) {
          // 寻址操作
          const filterArray = this.filterMatchedData(operatorData, conditions)
          if (filterArray) {
            operatorData.length = 0
            filterArray.map((matched) => {
              operatorData.push(matched)
            })
          }
        } else {
          this.deleteKeyByOprDel(operatorData, conditions)
        }
      }
    }
    return cpSouceBody
  }
  deleteKeyByOprDel (sourceObject, conditions) {
    const filterKeysArray = conditions['$^']
    // 没有删除符号或者被删除的源不是对象 中止操作
    if (!isObject(sourceObject) || !filterKeysArray) return false
    filterKeysArray.map((filterKey) => {
      if (sourceObject.hasOwnProperty(filterKey)) {
        delete sourceObject[filterKey]
      }
    })
  }
  // 过滤不匹配的规则
  filterMatchedData (sourceArray, conditions) {
    if (!isArray(sourceArray)) return false
    return sourceArray.filter((sourcePosData) => {
      const { matched } = handleSourceKeyValueByRules(sourcePosData, conditions)
      return matched
    })
  }
}
