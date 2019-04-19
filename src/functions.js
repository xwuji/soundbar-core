const SOURCEDATA = {}
const QUERYDATA = {
  mergeRule: {
    mergeGroupA: {

    },
    mergeGroupB: {

    },
    mergeGroupC: {

    }
  }
}

const httpRes = {
  'merge': {},
  'filter': {}
}
const REG_AND = /^\$&$/g 
const REG_OR = /^\$\|$/g
const REG_NOT = /^\$\^$/g 
const REG_RULEPATH =/^\$(\.\w+)+/g
const REG_LT = /^\$</g 
const REG_LTE = /^\$<=/g  
const REG_GT = /^\$>/g 
const REG_GTE = /^\$>=/g 
const REG_NOTEQUAL = /^\$!=/g
const REG_BETWEEN = /^\$<>/g
const REG_EXP = /^\$\$/g 



// 构建响应数据的结构
function httpResStructor () {
  const mergeGroups = Object.keys(QUERYDATA.mergeRule)
  mergeGroups.map((mg, index) => {
    httpRes.merge[mg] = []
  })
}


// 处理 '$.a.b.c'路径
function rulePathHandler (rulePath) {
  let resData = { ...SOURCEDATA }
  if (rulePath.indexOf('$.') < 0) return false
  const rulePaths = rulePath.split('.').splice(1) // ["a", "b", "c"]
  const rulePathLen = rulePaths.length
  for (let i = 0; i < rulePathLen; i++) {
    if (isObject(resData)) {
      resData = resData[rulePaths[i]]
    }
    if (isArray(resData)) {
      if (i + 1 !== rulePathLen) throw Error(`进入数组后筛选出来是最终层级，不能有更深的层级了，${rulePaths[i - 1]}是数组，${rulePaths[i]}是终点深度`)
      resData = ruleArrayChild(resData, rulePaths[i])
    }
    if (!resData) return false
  }
  return resData // { queryApiMutilList: [] } [] {}
}
// 处理查询路径中数组，则返回数组中包含后面路径的所有子元素
function ruleArrayChild (arrGroup, key) {
  let resGroup = []
  const filterGroup = arrGroup.filter((group, index) => {
    return group[key]
  })
  filterGroup.map((group, index) => {
    resGroup.push(group[key])
  })
  return {
    queryApiMutilList: resGroup // 表示选择出来了多组数据进行处理
  }
}

{
  'type': '11',
  '$>age': '20',
  '$!=skuid': '10023',
  '$$detail': '/^jdsku/g',
  '$|': {
    'type': '12',
    '$>age': '10'
  }
}

// 处理 condition
function conditionHandler (conditions) {
  const ckeys = Object.keys(conditions)
  const ckeysLen = ckeys.length
  if( ckeysLen === 0 ) return false
  for (let i = 0; i < ckeysLen; i++) {
    conditionKeyHandler(ckeys[i],conditions[ckeys[i]])
  }
}


function conditionKeyHandler (key,value) {
  if (REG_AND.test(key)) andCompare()
  else if (REG_OR.test(key)) orCompare()
  else if (REG_NOT.test(key)) notCompare()
  else if (REG_RULEPATH.test(key)) rulePathHandlerCompare()
  else if (REG_LT.test(key)) ltCompare()
  else if (REG_LTE.test(key)) lteCompare()
  else if (REG_GT.test(key)) gtCompare()
  else if (REG_GTE.test(key)) gteCompare()
  else if (REG_NOTEQUAL.test(key)) notEqualCompare()
  else if (REG_BETWEEN.test(key)) betweenCompare()
  else if (REG_EXP.test(key)) regExpCompare()
  else defaultCompare()
}

function defaultCompareSuc(key,value){
  const sourcePosData = {}
  const sourcePosValue = sourcePosData[key]
  if(!sourcePosValue) return false
  const typeArray = isArray(sourcePosValue)
  // 条件对比支持数组的长度和数值和字符串
  if(typeArray){
    if(typeof value !== 'number') throw Error('Arrays condition value not a number')
    return sourcePosValue.length === value
  }else if(typeof sourcePosValue === 'string' || typeof sourcePosValue === 'number'){
    return sourcePosValue === value
  }else{
    return false
  }
}

function testCurrentCondition (source, condition, symbol) {
  switch (symbol) {
    case '$<': return source < condition
    case '$<=': return source <= condition
    case '$>': return source > condition
    case '$>=': return source >= condition
    case '$!=': return source !== condition
    case '$<>': return condition[0] <= source && source <= condition[1]
    default:
      break
  }
}
