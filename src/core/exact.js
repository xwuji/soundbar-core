import { isArray, isObject, isEmptyObj } from '@lib/types.js'
import _ from 'lodash/object'

export default class GrabExactCore {
  constructor (queryGrapExactRules, sourceBody) {
    this.grapExactRes = {}
    this.queryGrapExactRules = queryGrapExactRules
    this.sourceBody = sourceBody
  }
  get getExactGroup () {
    const { queryGrapExactRules, sourceBody } = this
    if (!sourceBody) return
    if (!queryGrapExactRules || isEmptyObj(queryGrapExactRules)) return sourceBody
    let cpSouceBody = { ...sourceBody }
    // 取所有规则的路径
    let rulePathesArr = Object.keys(queryGrapExactRules)
    // 排序，越短层级越高，层级高的先处理
    rulePathesArr.sort((m, n) => {
      return m.length - n.length
    })
    // rulePathesArr => ['$.result','$.result.list','$.result.config']
    const rulePathesArrLen = rulePathesArr.length

    var _LIST_1 = _.get(cpSouceBody, 'result.list', [])
    var NEW_ARR = []
    for (let i = 0; i < _LIST_1.length; i++) {
      const _LIST_OBJ = _.pick(_LIST_1[i], ['typeFlag', 'typeDes', 'exactData'], [])
      NEW_ARR.push(_LIST_OBJ)
    }
    console.log('NEW_ARR', NEW_ARR)

    // 遍历每个路径进行处理
    for (let x = 0; x < rulePathesArrLen; x++) {
      const grapExactPath = rulePathesArr[x] // "$.result.list"
      const grapfieldArr = queryGrapExactRules[grapExactPath] // 匹配的路径下对应的选取方案
      const rulePathSplitArr = grapExactPath.split('.').splice(1)//  匹配的路径拆分 ['result','list']
      const rulePathSplitArrLen = rulePathSplitArr.length
      // let currSourceBody = { ...sourceBody }
      let originTempObj = {}
      let pathTempObj = {}
      for (let y = 0; y < rulePathSplitArrLen; y++) {
        // const currSourceValue = currSourceBody[rulePathSplitArr[y]]
        // tempObj[rulePathSplitArr[y]] = {}
        // if (y === rulePathSplitArrLen - 1) {
        //   tempObj[rulePathSplitArr[y]] = ''
        // }
        // this.grapExactRes = Object.assign({}, this.grapExactRes)
        originTempObj = Object.assign({}, originTempObj[rulePathSplitArr[y]])

        if (y === rulePathSplitArrLen - 1) {
          console.log(grapExactPath, '============data===========', originTempObj)
          // if (isArray(originTempObj)) {
          //   // 对其子元素对象下字段提取
          //   originTempObj.map((childObj) => {
          //     if (!isObject(childObj)) return
          //     let arrPathTempObj = {}
          //     grapfieldArr.map((field) => {
          //       arrPathTempObj = Object.assign({}, { [field]: childObj[field] })
          //     })
          //     arrPathTempObj =
          //   })
          // } else if (isObject(originTempObj)) {
          //   // 对其下字段提取
          //   grapfieldArr.map((field) => {
          //     pathTempObj = Object.assign({}, { [field]: originTempObj[field] })
          //   })
          // }
        }
        this.grapExactRes = Object.assign({}, this.grapExactRes, pathTempObj)
      }
    }
    return {
      // queryGrapExactRules: this.queryGrapExactRules,
      // sourceBody: this.sourceBody
      grapExactRes: this.grapExactRes
    }
  }
}
