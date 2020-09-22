/**
 * 按照路径精确提取字段
 * [dotPath]{String}:[field1,field2,...fieldn]{Array}
 * dotPath: 点符路径
 */

import { isArray, isObject, isEmptyObj } from '@lib/types.js'
import _ from 'lodash/object'

export default class ExactGrabCore {
  constructor (queryExactGrapRules, sourceBody) {
    this.exactGrabRes = {}
    this.queryExactGrapRules = queryExactGrapRules
    this.sourceBody = sourceBody
  }
  get getExactGroup () {
    const { queryExactGrapRules, sourceBody } = this
    if (!sourceBody) return
    if (!queryExactGrapRules || isEmptyObj(queryExactGrapRules)) return sourceBody
    let currSourceBody = { ...sourceBody }
    // 取所有规则的路径
    let rulePathesArr = Object.keys(queryExactGrapRules)
    // 排序，越短层级越高，层级高的先处理
    rulePathesArr.sort((m, n) => {
      return m.length - n.length
    })
    // rulePathesArr => ['$.result','$.result.list','$.result.config']
    const rulePathesArrLen = rulePathesArr.length
    // 遍历每个路径进行处理
    for (let x = 0; x < rulePathesArrLen; x++) {
      let pathFieldValue
      const grapExactPathWithprefix = rulePathesArr[x] // "$.result.list"
      const grapExactPath = grapExactPathWithprefix && grapExactPathWithprefix.replace(/^\$./g, '') // "result.list"
      const grapWhichfieldsArr = queryExactGrapRules[grapExactPathWithprefix] // 该路径下要选取的字段数组
      const sourcePosFieldValue = this.getOneFieldByPath(currSourceBody, grapExactPath)
      // 基于规则 exactGrap path的【末端】字段只有以下几种可能：数组，对象字面量或取不到该字段
      if (isArray(sourcePosFieldValue)) {
        pathFieldValue = this.grabFieldsFromArray(sourcePosFieldValue, grapWhichfieldsArr)
      } else if (isObject(sourcePosFieldValue)) {
        pathFieldValue = this.grabFieldsFromObject(sourcePosFieldValue, grapWhichfieldsArr)
      }
      pathFieldValue && this.setOneFieldByPath(grapExactPath, pathFieldValue)
    }
    return this.exactGrabRes
  }
  setOneFieldByPath (path, value) {
    if (!path || !value) throw Error('setOneFieldByPath path|value Is Not Exist')
    return _.set(this.exactGrabRes, path, value)
  }
  getOneFieldByPath (getObject = {}, path = '') {
    if (!isObject(getObject)) throw Error('getObject Must Be Object')
    return _.get(getObject, path)
  }
  grabFieldsFromObject (grabObject = {}, fields = []) {
    if (!isObject(grabObject)) throw Error('grabObject Must Be Object')
    if (!isArray(fields)) throw Error('fields Must Be Array')
    return _.pick(grabObject, fields)
  }
  grabFieldsFromArray (grabArr = [], fields = []) {
    if (!isArray(grabArr) || !isArray(fields)) throw Error('grabFieldsFromArray Every Agru Must Be Array')
    let resArr = []
    try {
      for (let i = 0; i < grabArr.length; i++) {
        const GRAB_OBJ = _.pick(grabArr[i], fields)
        !isEmptyObj(GRAB_OBJ) && resArr.push(GRAB_OBJ)
      }
    } catch (err) {
      return grabArr
    }
    return resArr
  }
}
