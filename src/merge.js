const SOURCEDATA = require('./mock/source.js')
const QUERYDATA = require('./mock/query.js')
const TYPES = require('./types.js')
const { regMatch } = require('./config')
const { fetchOutKeyChild, sourceMatchConditions } = require('./functions.js')
const { isArray, isObject } = TYPES

let mergeGroupsList = {}

module.exports = function mergeGroupData () {
  const { mergeRule } = QUERYDATA
  const mergeGroupsListKeys = Object.keys(mergeRule) // merge自定义分组集合 ['skusOrImgs','authorDetailFloors']
  const mergeGroupsListLen = mergeGroupsListKeys.length
  for (let i = 0; i < mergeGroupsListLen; i++) {
    let orBranchConditions
    const mergeGroupName = mergeGroupsListKeys[i]
    const mergeGroup = mergeRule[mergeGroupName] // merge单个分组 'skusOrImgs'
    mergeGroupsList[mergeGroupName] = []
    const mergeRulePathes = Object.keys(mergeGroup)
    const firstRulePath = mergeRulePathes[0] // 前期只考虑同纬度的筛选合并，多维度的合并筛选合并后期支持
    const sourceRulePathData = sourceDataMapRulePath(firstRulePath)
    const conditions = mergeGroup[firstRulePath]
    // 如果条件中含有或(||)分支条件
    if (conditions['$|']) {
      // 删除原条件组中的或逻辑，储存在变量中
      orBranchConditions = conditions['$|']
      delete conditions['$|']
    }
    mergeHandler(sourceRulePathData, mergeGroupName, conditions)
    if (mergeGroupsList[mergeGroupName].length === 0) { // 原条件不匹配采用备用条件
      mergeHandler(sourceRulePathData, mergeGroupName, orBranchConditions)
    }
  }
  return mergeGroupsList
}
function addNewMergeData (params) {
  // 路径映射的集合和对应的条件进行匹配 匹配成功返回匹配的集合
  const { matched, sourceData } = sourceMatchConditions(params.sourceMatched, params.conditions)
  if (matched) {
    mergeGroupsList[params.mergeGroupName].push(sourceData)
  } else {
    return false
  }
}
function mergeHandler (sourceRulePathData, mergeGroupName, conditions) {
  if (isArray(sourceRulePathData)) {
    if (sourceRulePathData.mutilRes) {
      // 多结果，子项才是筛选出的原数据
      const sourceRulePathDataLen = sourceRulePathData.length
      for (let i = 0; i < sourceRulePathDataLen; i++) { // 对子项进行筛选合并
        if (isArray(sourceRulePathData[i])) { // 子项是数组的话 对数组子项进项筛选 符合条件的合并到httpRes merge 自定义分组中
          sourceRulePathData[i].map((childData) => {
            addNewMergeData({
              sourceMatched: childData,
              mergeGroupName: mergeGroupName,
              conditions
            })
          })
        } else if (isObject(sourceRulePathData[i])) { // 子项是对象的话 对对象本身进项筛选 符合条件的合并到httpRes merge 自定义分组中
          addNewMergeData({
            sourceMatched: sourceRulePathData[i],
            mergeGroupName: mergeGroupName,
            conditions
          })
        }
      }
    } else {
      // 单结果，原数据本身就是数组
      sourceRulePathData.map((childData) => {
        addNewMergeData({
          sourceMatched: childData,
          mergeGroupName: mergeGroupName,
          conditions
        })
      })
    }
  } else if (isObject(sourceRulePathData)) { // 原数据是对象形式
    addNewMergeData({
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
function sourceDataMapRulePath (rulePath) {
  const { REG_RULEPATH } = regMatch
  let resData = { ...SOURCEDATA }
  if (rulePath.match(REG_RULEPATH)) {
    // 处理 '$.a.b.c'路径 a、b、c只能是对象或者数组形式
    const rulePathes = rulePath.split('.').splice(1) // ["a", "b", "c"]
    const rulePathLen = rulePathes.length
    for (let i = 0; i < rulePathLen; i++) {
      if (isObject(resData)) {
        resData = resData[rulePathes[i]]
      } else if (isArray(resData)) {
        if (i + 1 !== rulePathLen) throw Error(`进入数组后筛选出来是最终层级，不能有更深的层级了，${rulePaths[i - 1]}是数组，${rulePaths[i]}是终点深度`)
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
