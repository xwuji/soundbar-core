// node执行输出
const { MergeCore, FilterCore } = require('../dist/index.js')
const { mergeRule, filterRule } = require('./db/query.js')
const sourceDB = require('./db/source.js')

const mergeCore = new MergeCore(mergeRule, sourceDB)
const mergeGroupData = mergeCore.getMergeGroup
console.log(JSON.stringify(mergeGroupData))

// const filterCore = new FilterCore(filterRule, sourceDB)
// const filterGroupData = filterCore.getFilterGroup
// console.log(JSON.stringify(filterGroupData))
