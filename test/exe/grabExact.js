// node执行输出
const { ExactGrabCore } = require('../../dist/index.js')
const { exactGrabRule } = require('../db/query.js')
const sourceDB = require('../db/source.js')

const exactGrabCore = new ExactGrabCore(exactGrabRule, sourceDB)
const exactGrabGroupData = exactGrabCore.getExactGroup
console.log(JSON.stringify(exactGrabGroupData))
