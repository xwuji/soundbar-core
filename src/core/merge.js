import { isArray, isObject, isEmptyObj } from '@lib/types.js'
import { fetchOutKeyChild, handleSourceKeyValueByRules } from '@lib/coreFns.js'
import { OPR_REG_MATCH } from '@config'
export default class MergeCore {
  constructor (queryMergeRules, sourceBody) {
    this.mergeGroupsList = {}
    this.queryMergeRules = queryMergeRules
    this.sourceBody = sourceBody
  }
  get getMergeGroup () {
    const { sourceBody, queryMergeRules } = this
    if (!sourceBody) return
    if (!queryMergeRules || isEmptyObj(queryMergeRules)) return sourceBody
    const mergeGroupKeys = Object.keys(queryMergeRules) // merge自定义分组集合 ['skusOrImgs','authorDetailFloors']
    const mergeGroupKeysLen = mergeGroupKeys.length
    for (let i = 0; i < mergeGroupKeysLen; i++) {
      let orBranchConditions
      const mergeGroupCurrKey = mergeGroupKeys[i]
      const mergeGroupRule = queryMergeRules[mergeGroupCurrKey] // merge单个分组 'skusOrImgs'
      this.mergeGroupsList[mergeGroupCurrKey] = []
      const mergeRulePathes = Object.keys(mergeGroupRule)
      const firstRulePath = mergeRulePathes[0] // 注意 前期只考虑同纬度的筛选合并，多维度的合并筛选合并后期支持
      const sourceRulePathData = this.sourceDataMapRulePath(firstRulePath, sourceBody)
      const conditions = mergeGroupRule[firstRulePath]

      // 如果条件中含有或(||)分支条件
      if (conditions['$|']) {
        // 删除原条件组中的或逻辑，储存在变量中
        orBranchConditions = conditions['$|']
        delete conditions['$|']
      }
      this.mergeHandler(sourceRulePathData, mergeGroupCurrKey, conditions)
      if (this.mergeGroupsList[mergeGroupCurrKey].length === 0) { // 原条件不匹配采用备用条件 或的逻辑  后期支持多条件合并？
        this.mergeHandler(sourceRulePathData, mergeGroupCurrKey, orBranchConditions)
      }
    }
    return this.mergeGroupsList
  }

  addNewMergeData (params) {
    // 路径映射的集合和对应的条件进行匹配 匹配成功返回匹配的集合
    const { matched, sourcekeyValue } = handleSourceKeyValueByRules(params.sourceMatched, params.conditions)
    if (matched) {
      this.mergeGroupsList[params.mergeGroupName].push(sourcekeyValue)
    } else {
      return false
    }
  }
  mergeHandler (sourceRulePathData, mergeGroupName, conditions) {
    if (isArray(sourceRulePathData)) {
      if (sourceRulePathData.mutilRes) {
        // 多结果，子项才是筛选出的原数据
        const sourceRulePathDataLen = sourceRulePathData.length
        for (let i = 0; i < sourceRulePathDataLen; i++) { // 对子项进行筛选合并
          if (isArray(sourceRulePathData[i])) { // 子项是数组的话 对数组子项进项筛选 符合条件的合并到httpRes merge 自定义分组中
            sourceRulePathData[i].map((childData) => {
              this.addNewMergeData({
                sourceMatched: childData,
                mergeGroupName: mergeGroupName,
                conditions
              })
            })
          } else if (isObject(sourceRulePathData[i])) { // 子项是对象的话 对对象本身进项筛选 符合条件的合并到httpRes merge 自定义分组中
            this.addNewMergeData({
              sourceMatched: sourceRulePathData[i],
              mergeGroupName: mergeGroupName,
              conditions
            })
          }
        }
      } else {
        // 单结果，原数据本身就是数组
        sourceRulePathData.map((childData) => {
          this.addNewMergeData({
            sourceMatched: childData,
            mergeGroupName: mergeGroupName,
            conditions
          })
        })
      }
    } else if (isObject(sourceRulePathData)) { // 原数据是对象形式
      this.addNewMergeData({
        sourceMatched: sourceRulePathData,
        mergeGroupName: mergeGroupName,
        conditions
      })
    }
  }
  /**
   * 根据路径找到对应原数据中的集合值
   * @param {string} rulePath
   * @returns 匹配到的所有集合
   */
  sourceDataMapRulePath (rulePath, sourceBody) {
    const { REG_RULEPATH } = OPR_REG_MATCH
    let resData = { ...sourceBody }
    if (rulePath.match(REG_RULEPATH)) {
      // 处理 '$.a.b.c'路径 a、b、c只能是对象或者数组形式
      const rulePathes = rulePath.split('.').splice(1) // ["a", "b", "c"]
      const rulePathLen = rulePathes.length
      for (let i = 0; i < rulePathLen; i++) {
        if (isObject(resData)) {
          resData = resData[rulePathes[i]]
        } else if (isArray(resData)) {
          if (i + 1 !== rulePathLen) throw Error(`进入数组后筛选出来是最终层级，不能有更深的层级了，${rulePathes[i - 1]}是数组，${rulePathes[i]}是终点深度`)
          resData = fetchOutKeyChild(resData, rulePathes[i])
        }
        if (!resData) return false
      }
    } else {
      // '非$.路径选择'
      const straightRes = resData[rulePath]
      if (straightRes) {
        resData = straightRes
      } else {
        resData = {}
      }
    }
    // resData有mutilRes属性，表示当前筛选出来的结果是多结果的，不是当前数组本身而是数组里的子项
    return resData // [] or {}
  }
}
