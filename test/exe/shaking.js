// node执行输出
const { ShakingCore } = require('../../dist/index.js')
const { ShakingRule } = require('../db/query.js')
const sourceDB = require('../db/source.js')

const filterCore = new ShakingCore(ShakingRule, sourceDB)
const filterGroupData = filterCore.getFilterGroup
console.log(JSON.stringify(filterGroupData))
