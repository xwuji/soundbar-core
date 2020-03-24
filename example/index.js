// node执行输出
const { mergeGroupData, filterGroupData } = require('../dist/index.js')
const { mergeRule, filterRule } = require('./db/query.js')
const sourceDB = require('./db/source.js')

const _mergeGroupData = mergeGroupData(mergeRule, sourceDB)
console.log(JSON.stringify(_mergeGroupData))
// const _filterGroupData = filterGroupData()
// console.log(_filterGroupData)
