// node执行输出
const { localTest, onlyPrintDebug } = require('../../soundbar.config.js')
// const { ExactGrabCore } = require('@jd/soundbar-core')
const { ExactGrabCore } = require(localTest ? '../../dist/index.js' : '@jd/soundbar-core')
const { exactGrabRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source.js')

const exactGrabCore = new ExactGrabCore(exactGrabRule, sourceDB)
const exactGrabGroupData = exactGrabCore.getExactGroup
!onlyPrintDebug && console.log(JSON.stringify(exactGrabGroupData))
