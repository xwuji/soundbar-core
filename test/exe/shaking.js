// node执行输出
const { ShakingCore } = require('../../dist/index.js')
const { shakingRule } = require('../db/query.js')
const sourceDB = require('../db/source.js')

const filterCore = new ShakingCore(shakingRule, sourceDB)
const filterGroupData = filterCore.getFilterGroup
console.log(JSON.stringify(filterGroupData))
