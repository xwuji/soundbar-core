import { isArray, isObject } from '@lib/types.js'
import { handleSourceKeyValueByRules } from '@lib/functions.js'

export default class FilterCore {
  constructor (clientQueryFilterRule, sourceBody) {
    this.clientQueryFilterRule = clientQueryFilterRule
    this.sourceBody = sourceBody
  }
  get getFilterGroup () {
    const { clientQueryFilterRule, sourceBody } = this
    if (!sourceBody) return
    if (!clientQueryFilterRule) return sourceBody
    let filterResData = { ...sourceBody }
    let filterPathes = Object.keys(clientQueryFilterRule)
    // 排序，层级高的先处理
    filterPathes.sort((m, n) => {
      return m.length - n.length
    })
    // filterPathes => ["$.code","$.result.list","$.result.config","$.result.pageView","$.result.list.description"]
    const filterPathesLen = filterPathes.length
    for (let i = 0; i < filterPathesLen; i++) {
      let operatorData = filterResData
      const filterPath = filterPathes[i] // "$.result.list"
      const conditions = clientQueryFilterRule[filterPath] // {}
      const rulePathes = filterPath.split('.').splice(1)//  ['result','list']
      const rulePathLen = rulePathes.length
      for (let i = 0; i < rulePathLen; i++) {
        operatorData = operatorData[rulePathes[i]] // filterResData['result']['list']
        if (isArray(operatorData) && (i === rulePathLen - 1)) {
          // 寻址操作
          const filterArray = this.arrayFilterEvent(operatorData, conditions)
          if (filterArray) {
            operatorData.length = 0
            filterArray.map((matched) => {
              operatorData.push(matched)
            })
          }
        } else {
          this.objectFilterEvent(operatorData, conditions)
        }
      }
    }
    return filterResData
  }
  objectFilterEvent (sourceObject, conditions) {
    const filterKeysArray = conditions['$^']
    if (!isObject(sourceObject) || !filterKeysArray) return false
    filterKeysArray.map((filterKey) => {
      if (sourceObject.hasOwnProperty(filterKey)) {
        delete sourceObject[filterKey]
      }
    })
  }
  arrayFilterEvent (sourceArray, conditions) {
    if (!isArray(sourceArray)) return false
    return sourceArray.filter((sourcePosData) => {
      const { matched } = handleSourceKeyValueByRules(sourcePosData, conditions)
      return !matched
    })
  }
}
