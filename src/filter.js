if (filterRule) {
  let filterResData = {}
  let sourceData = { ...SOURCEDATA }
  let filterPathes = Object.keys(filterRule)
  // 排序，层级高的先处理
  filterPathes.sort((m, n) => {
    return m.length - n.length
  })
  // filterPathes => ["$.code","$.result.list","$.result.config","$.result.pageView","$.result.list.description"]
  const filterPathesLen = filterPathes.length
  for (let i = 0; i < filterPathesLen; i++) {
    let operatorData = sourceData
    const filterPath = filterPathes[i] // "$.result.list"
    const conditions = filterRule[filterPath] // true or {}
    const rulePathes = filterPath.split('.').splice(1)//  ['result','list']
    const rulePathLen = rulePathes.length
    if (isBoolean(conditions)) {
      // false情况下删除原数据该字段
      if (!conditions) {
        for (let i = 0; i < rulePathLen; i++) {
          if (i === rulePathLen - 1) {
            delete operatorData[rulePathes[i]]
          } else {
            operatorData = operatorData[rulePathes[i]]
          }
        }
      }
    } else {
      let orBranchConditions
      // 如果条件中含有或(||)分支条件
      if (conditions['$|']) {
      // 删除原条件组中的或逻辑，储存在变量中
        orBranchConditions = conditions['$|']
        delete conditions['$|']
      }
    }
  }
}
