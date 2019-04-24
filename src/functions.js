const SOURCEDATA = require('./mock/source.js')
const TYPES = require('./types.js')
const { isArray, isObject } = TYPES
const QUERYDATA = {
  mergeRule: {
    skusOrImgs: {
      '$.result.list.description': {
        'type': '2',
        '$|': {
          'type': '3'
        }
      }
    },
    authorDetailFloors: {
      '$.result.list': {
        '$$floorAppearance': ['authorDetailFloorsss', 'g'],
        '$|': {
          '$$floorAppearance': ['similarArticleFloor', 'g']
        }
      }
    }
  },
  filterRule: {
    // '$.result.list': {
    //   '$!=floorApearrence': 'similarArticleFloor_2'
    // },
    '$.result.config': {
      '$^': ['footer']
    }
  }
}

let httpRes = {
  merges: {},
  filters: {}
}
const REG_AND = /^\$&$/g
const REG_OR = /^\$\|$/g
const REG_NOT = /^\$\^$/g
const REG_RULEPATH = /^\$(\.\w+)+/g
const REG_LT = /^\$</g
const REG_LTE = /^\$<=/g
const REG_GT = /^\$>/g
const REG_GTE = /^\$>=/g
const REG_NOTEQUAL = /^\$!=/g
const REG_BETWEEN = /^\$<>/g
const REG_EXP = /^\$\$/g

function returnHttpResStructor () {
  const { mergeRule, filterRule } = QUERYDATA
  const pushInMergeRes = (params) => {
    const res = computedMatchResult(params.sourceMatched, params.conditions)
    res && httpRes.merges[params.mergeGroupName].push(res)
  }
  const sourceRulePathDataHandler = (sourceRulePathData, mergeGroupName, conditions) => {
    if (isArray(sourceRulePathData)) {
      if (sourceRulePathData.mutilRes) { // 多结果，子项才是原数据集合
        const sourceRulePathDataLen = sourceRulePathData.length
        for (let i = 0; i < sourceRulePathDataLen; i++) { // 对子项进行筛选合并
          if (isArray(sourceRulePathData[i])) { // 子项是数组的话 对数组子项进项筛选 符合条件的合并到httpRes merge 自定义分组中
            sourceRulePathData[i].map((childData) => {
              pushInMergeRes({
                sourceMatched: childData,
                mergeGroupName: mergeGroupName,
                conditions
              })
            })
          } else if (isObject(sourceRulePathData[i])) { // 子项是对象的话 对对象本身进项筛选 符合条件的合并到httpRes merge 自定义分组中
            pushInMergeRes({
              sourceMatched: sourceRulePathData[i],
              mergeGroupName: mergeGroupName,
              conditions
            })
          }
        }
      } else { // 单结果，原数据本身就是数组
        sourceRulePathData.map((childData) => {
          pushInMergeRes({
            sourceMatched: childData,
            mergeGroupName: mergeGroupName,
            conditions
          })
        })
      }
    } else if (isObject(sourceRulePathData)) { // 原数据是对象形式
      pushInMergeRes({
        sourceMatched: sourceRulePathData,
        mergeGroupName: mergeGroupName,
        conditions
      })
    }
  }
  if (mergeRule) {
    const mergeGroups = Object.keys(mergeRule) // merge自定义分组集合 ['skusOrImgs','authorDetailFloors']
    const mergeGroupsLen = mergeGroups.length
    for (let i = 0; i < mergeGroupsLen; i++) {
      let orBranchConditions
      const mergeGroupName = mergeGroups[i]
      const mergeGroup = mergeRule[mergeGroupName] // merge单个分组 'skusOrImgs'
      httpRes.merges[mergeGroupName] = []
      const mergeRulePathes = Object.keys(mergeGroup)
      const firstRulePath = mergeRulePathes[0] // 前期只考虑一个深度的筛选合并，多个深度的合并筛选合并后期支持
      const sourceRulePathData = rulePathHandlerCompare(firstRulePath)
      const conditions = mergeGroup[firstRulePath]
      // 如果条件中含有或(||)分支条件
      if (conditions['$|']) {
        // 删除原条件组中的或逻辑，储存在变量中
        orBranchConditions = conditions['$|']
        delete conditions['$|']
      }
      sourceRulePathDataHandler(sourceRulePathData, mergeGroupName, conditions)
      if (httpRes.merges[mergeGroupName].length === 0) { // 原条件不匹配采用备用条件
        sourceRulePathDataHandler(sourceRulePathData, mergeGroupName, orBranchConditions)
      }
    }
  }
  if (filterRule) {
    const filterPathes = Object.keys(filterRule)
    const filterPathesLen = filterPathes.length
    for (let i = 0; i < filterPathesLen; i++) {
      const filterPath = filterPathes[i]
      const sourceRulePathData = rulePathHandlerCompare(filterPath)
      const conditions = filterRule[filterPath]
      const rulePaths = filterPath.split('.').splice(1) // ["result", "list", "description"]
      const rulePathLen = rulePaths.length
      let path = ''
      for (let i = 0; i < rulePathLen; i++) {
        path = path + '[' + rulePaths[i] + ']'
      }
      if (isArray(sourceRulePathData)) {
        const sourceRulePathDataLen = sourceRulePathData.length
        for (let i = 0; i < sourceRulePathDataLen; i++) {
          const res = computedMatchResult(sourceRulePathData[i], conditions)
          if (res) {
            // evil(`httpRes.filters${path}.splice(${i},1)`)
          }
        }
      } else if (isObject(sourceRulePathData)) { // 原数据是对象形式
        const res = computedMatchResult(sourceRulePathData, conditions)
        if (res) {
          // evil(`httpRes.filters${path}=${JSON.stringify(res)}`)
        }
      }
    }
  }
  console.log(JSON.stringify(httpRes))
}

function evil (str) {
  var Fn = Function
  return new Fn(str)()
}
function rulePathHandlerCompare (rulePath) {
  let resData = { ...SOURCEDATA }
  // 处理 '$.a.b.c'路径
  if (rulePath.match(REG_RULEPATH)) {
    const rulePaths = rulePath.split('.').splice(1) // ["a", "b", "c"]
    const rulePathLen = rulePaths.length
    for (let i = 0; i < rulePathLen; i++) {
      if (isObject(resData)) {
        resData = resData[rulePaths[i]]
      } else if (isArray(resData)) {
        if (i + 1 !== rulePathLen) throw Error(`进入数组后筛选出来是最终层级，不能有更深的层级了，${rulePaths[i - 1]}是数组，${rulePaths[i]}是终点深度`)
        resData = ruleArrayChild(resData, rulePaths[i])
      }
      if (!resData) return false
    }
  } else { // '非$.路径选择'
    const straightRes = resData[rulePath]
    straightRes && (resData = straightRes)
  }
  // resData有mutilRes属性，表示当前筛选出来的结果是多结果的，不是当前数组本身而是数组里的子项
  return resData // [] or {}
}

// 处理查询路径中数组，则返回数组中包含后面路径的所有子元素
function ruleArrayChild (arrGroup, key) {
  let resGroup = []
  resGroup.mutilRes = true // 表示选择出来了多组数据
  const filterGroup = arrGroup.filter((group, index) => {
    return group[key]
  })
  filterGroup.map((group, index) => {
    resGroup.push(group[key])
  })
  return resGroup
}

// 处理 condition
function computedMatchResult (sourceData, conditions, ignoreOr) {
  const ckeys = Object.keys(conditions)
  const ckeysLen = ckeys.length
  const deleteKeys = []
  let entryThis = true
  if (ckeysLen === 0) return false
  for (let i = 0; i < ckeysLen; i++) {
    let ckey = ckeys[i] // 匹配的key
    let condit = conditions[ckey] // 匹配的conidtion
    if (ckey.match(REG_NOT)) {
      const deleteKey = ckey.replace(REG_NOT, '')
      deleteKeys.push = deleteKey
    } else if (ckey.match(REG_LT)) {
      const key = ckey.replace(REG_LT, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'lt')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_LTE)) {
      const key = ckey.replace(REG_LTE, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'lte')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_GT)) {
      const key = ckey.replace(REG_GT, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'gt')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_GTE)) {
      const key = ckey.replace(REG_GTE, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'gte')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_NOTEQUAL)) {
      const key = ckey.replace(REG_NOTEQUAL, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'notEqual')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_BETWEEN)) {
      const key = ckey.replace(REG_BETWEEN, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'bt')
      entryThis = entryThis && compareRes
    } else if (ckey.match(REG_EXP)) {
      const key = ckey.replace(REG_EXP, '')
      const compareRes = defaultCompareSuc(sourceData, key, condit, 'reg')
      entryThis = entryThis && compareRes
    } else if (!ckey.match(REG_OR)) {
      // and逻辑直接忽略符号，执行默认逻辑
      let key
      if (ckey.match(REG_AND)) {
        key = ckey.replace(REG_AND, '')
      } else {
        key = ckey
      }
      entryThis = entryThis && defaultCompareSuc(sourceData, key, condit)
    }
  }
  if (entryThis) {
    deleteKeys.map((dk) => {
      delete sourceData[dk]
    })
    return sourceData // 条件都满足 返回原数据 但是要删除排除掉的数据
  } else {
    return false
  }
}

function orBranch (sourceData, orConditions) {
  // or逻辑分支内不再支持or逻辑
  return computedMatchResult(sourceData, orConditions, true)
}

function switchMathCompare (a, b, mathSymbol) {
  try {
    switch (mathSymbol) {
      case 'lt':
        return a < b
      case 'lte':
        return a <= b
      case 'gt':
        return a > b
      case 'gte':
        return a >= b
      case 'notEqual':
        return a !== b
      case 'bt':
        return a > b[0] && a < b[1]
      case 'reg':
        const reg = new RegExp(b[0], b[1])
        return !!a.match(reg)
      default:
        return a === b
    }
  } catch (error) {
    throw new Error(error)
  }
}
function defaultCompareSuc (sourceData, key, value, mathSymbol) {
  const sourcePosValue = sourceData[key]
  if (!sourcePosValue) return false
  const typeArray = isArray(sourcePosValue)
  // 条件对比支持数组的长度和数值和字符串
  if (typeArray) {
    if (typeof value !== 'number') throw Error('Arrays condition value not a number')
    return switchMathCompare(sourcePosValue.length, value, mathSymbol)
  } else if (typeof sourcePosValue === 'string' || typeof sourcePosValue === 'number') {
    return switchMathCompare(sourcePosValue, value, mathSymbol)
  } else {
    return false
  }
}
returnHttpResStructor()
