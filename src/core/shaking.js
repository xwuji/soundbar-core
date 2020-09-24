import { isArray, isObject, isEmptyObj } from '@lib/types.js'
import { handleSourceKeyValueByRules } from '@lib/coreFns.js'

export default class ShakingCore {
  constructor (queryFilterRules, sourceBody) {
    this.queryFilterRules = queryFilterRules
    this.sourceBody = sourceBody
  }
  get getFilterGroup () {
    const { queryFilterRules, sourceBody } = this
    if (!sourceBody) return
    if (!queryFilterRules || isEmptyObj(queryFilterRules)) return sourceBody
    let cpSouceBody = { ...sourceBody }
    // 取所有规则的路径
    let rulePathesArr = Object.keys(queryFilterRules)
    // 排序，越短层级越高，层级高的先处理
    rulePathesArr.sort((m, n) => {
      return m.length - n.length
    })
    // rulePathesArr => ["$.code","$.result.list","$.result.config","$.result.pageView","$.result.list.description"]
    const rulePathesArrLen = rulePathesArr.length
    // 遍历每个路径进行处理
    for (let i = 0; i < rulePathesArrLen; i++) {
      let operatorData = cpSouceBody
      const filterPath = rulePathesArr[i] // "$.result.list"
      const conditions = queryFilterRules[filterPath] // 匹配的路径下对应的规则
      const rulePathSplitArr = filterPath.split('.').splice(1)//  匹配的路径拆分 ['result','list']
      const rulePathSplitArrLen = rulePathSplitArr.length
      for (let i = 0; i < rulePathSplitArrLen; i++) {
        operatorData = operatorData[rulePathSplitArr[i]] // operatorData['result'] || operatorData['result']['list']
        // 数组中根据条件过滤子元素，对象字面量中直接删除方式过滤子元素
        if (isArray(operatorData) && (i === rulePathSplitArrLen - 1)) {
          // 源数据节点是数组类型且是末点元素
          const remainDataArray = this.filterMatchedData(operatorData, conditions)
          if (remainDataArray.length > 0) {
            // 寻址操作 用操作变量改变源数据
            operatorData.length = 0
            remainDataArray.map((matched) => {
              operatorData.push(matched)
            })
          }
        } else if (conditions['$^'] && isObject(operatorData)) { // 有删除符号且被删除的源是对象
          conditions['$^'].map((filterKey) => {
            if (operatorData.hasOwnProperty(filterKey)) {
              delete operatorData[filterKey]
            }
          })
        }
      }
    }
    return cpSouceBody
  }
  // 过滤满足条件的数据对象
  filterMatchedData (sourceArray, conditions) {
    if (!isArray(sourceArray)) return false
    return sourceArray.filter((sourcePosData) => {
      const { matched } = handleSourceKeyValueByRules(sourcePosData, conditions)
      return !matched
    })
  }
}
