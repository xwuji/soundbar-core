const types = require('./types.js')
const sourceData = require('./mock/source.js')
const queryData = require('./mock/query.js')
const { isArray, isObject } = types

if (isArray(queryData)) {
  // 多接口处理拼接

} else {
  const { url, params = {}, mergeRule, filterRule } = queryData
  let merge = {}
  if (!url) throw Error('url is empty')
  // 请求服务端数据 url + params
  // ...
  if (mergeRule) {
    // 如果没有mergeRule 不返回相关数据
    if (!isObject(mergeRule)) throw Error('MergeRule goes wrong data-type')
    const mergeKeys = Object.keys(mergeRule) // [smallSkus ...]
    for (let i = 0; i < mergeKeys.length; i++) {
      let source = { ...sourceData }
      let mergeValue
      const ruleGroup = mergeRule[mergeKeys[i]] // smallSkus
      const rulePath = Object.keys(ruleGroup)[0] // '$.result.list.description'
      const rulePathList = rulePath.split('.').splice(1) // ["result", "list", "description"]
      const rules = ruleGroup[rulePath]
      const rulesKeys = Object.keys(rules)
      for (let i = 0; i < rulePathList.length; i++) {
        if (isArray(source)) {
          const _source = source.filter((item) => {
            return item[rulePathList[i]]
          })
          source = _source[0][rulePathList[i]]
        } else if (isObject(source)) {
          source = source[rulePathList[i]] // result list
        }
      }
      // description
      if (isArray(source)) {
        mergeValue = source.filter((item) => {
          let res = true
          for (let i = 0; i < rulesKeys.length; i++) {
            res = res && (item[rulesKeys] === rules[rulesKeys])
          }
          return res
        })
      }
      merge = { ...merge, ...{ [mergeKeys[i]]: mergeValue } }
    }
    console.log(merge)
  }
  if (filterRule) {
    // 如果没有filterRule 返回所有原数据
  }
}
