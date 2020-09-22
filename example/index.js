// node执行输出
const { MergeCore, ShakingCore, ExactGrabCore } = require('../dist/index.js')
const { mergeRule, ShakingRule, exactGrabRule } = require('./db/query.js')
const sourceDB = require('./db/source.js')

// const mergeCore = new MergeCore(mergeRule, sourceDB)
// const mergeGroupData = mergeCore.getMergeGroup
// console.log(JSON.stringify(mergeGroupData))

// const filterCore = new ShakingCore(ShakingRule, sourceDB)
// const filterGroupData = filterCore.getFilterGroup
// console.log(JSON.stringify(filterGroupData))

const exactGrabCore = new ExactGrabCore(exactGrabRule, sourceDB)
const exactGrabGroupData = exactGrabCore.getExactGroup
console.log(JSON.stringify(exactGrabGroupData))
