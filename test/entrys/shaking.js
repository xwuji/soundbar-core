// node执行输出
const { localTest, onlyPrintDebug } = require('../../soundbar.config.js')
const { ShakingCore } = require(localTest ? '../../dist/index.js' : '@jd/soundbar-core')
const { shakingRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source2.js')

const filterCore = new ShakingCore(shakingRule, sourceDB)
const filterGroupData = filterCore.getFilterGroup
!onlyPrintDebug && console.log(JSON.stringify(filterGroupData))
