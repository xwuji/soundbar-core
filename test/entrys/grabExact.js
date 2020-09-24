// node执行输出
const { ExactGrabCore } = require('../../dist/index.js')
const { exactGrabRule } = require('../rules/query.js')
const sourceDB = require('../source-data/source.js')

const exactGrabCore = new ExactGrabCore(exactGrabRule, sourceDB)
const exactGrabGroupData = exactGrabCore.getExactGroup
console.log(JSON.stringify(exactGrabGroupData))
