const { isArray, isObject } = require('@lib/types.js')
const { sourceMatchConditions } = require('@lib/functions.js')

module.exports = function filterGroupData (clientQueryFilterRule, sourceBody) {
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
        const filterArray = arrayFilterEvent(operatorData, conditions)
        if (filterArray) {
          operatorData.length = 0
          filterArray.map((matched) => {
            operatorData.push(matched)
          })
        }
      } else {
        objectFilterEvent(operatorData, conditions)
      }
    }
  }
  return filterResData
}
function objectFilterEvent (sourceObject, conditions) {
  const filterKeysArray = conditions['$^']
  if (!isObject(sourceObject) || !filterKeysArray) return false
  filterKeysArray.map((filterKey) => {
    if (sourceObject.hasOwnProperty(filterKey)) {
      delete sourceObject[filterKey]
    }
  })
}
function arrayFilterEvent (sourceArray, conditions) {
  if (!isArray(sourceArray)) return false
  return sourceArray.filter((sourcePosData) => {
    const { matched } = sourceMatchConditions(sourcePosData, conditions)
    return !matched
  })
}
