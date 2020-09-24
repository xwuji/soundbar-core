// node执行输出
const { ShakingCore } = require('../../dist/index.js')
const { shakingRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source.js')

const filterCore = new ShakingCore(shakingRule, sourceDB)
const filterGroupData = filterCore.getFilterGroup
console.log(JSON.stringify(filterGroupData))
