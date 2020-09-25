// node执行输出
const { localTest, onlyPrintDebug } = require('../../soundbar.config.js')
const { MergeCore } = require(localTest ? '../../dist/index.js' : '@jd/soundbar-core')
const { mergeRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source.js')

const mergeCore = new MergeCore(mergeRule, sourceDB)
const mergeGroupData = mergeCore.getMergeGroup
!onlyPrintDebug && console.log(JSON.stringify(mergeGroupData))
