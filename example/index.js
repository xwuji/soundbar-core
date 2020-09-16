// node执行输出
const { MergeCore, FilterCore, GrabExactCore } = require('../dist/index.js')
const { mergeRule, filterRule, exactRule } = require('./db/query.js')
const sourceDB = require('./db/source.js')

// const mergeCore = new MergeCore(mergeRule, sourceDB)
// const mergeGroupData = mergeCore.getMergeGroup
// console.log(JSON.stringify(mergeGroupData))

// const filterCore = new FilterCore(filterRule, sourceDB)
// const filterGroupData = filterCore.getFilterGroup
// console.log(JSON.stringify(filterGroupData))

const grabExactCore = new GrabExactCore(exactRule, sourceDB)
const grabExactGroupData = grabExactCore.getExactGroup
console.log(JSON.stringify(grabExactGroupData))
