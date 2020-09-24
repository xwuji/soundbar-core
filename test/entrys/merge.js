// node执行输出
const { MergeCore } = require('../../dist/index.js')
const { mergeRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source.js')

const mergeCore = new MergeCore(mergeRule, sourceDB)
const mergeGroupData = mergeCore.getMergeGroup
console.log(JSON.stringify(mergeGroupData))
