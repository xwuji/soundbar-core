const mergeGroupData = require('@core/merge.js')
const filterGroupData = require('@core/filter.js')

/**
 * mergeGroupData、filterGroupData
 * @param {rules} 用户请求参数中的mergeRule或者filterRule 需求中间层结构出来入参
 * @param {sourceBody} 上游接口请求返回的原始数据
 * @returns {object}
 */
module.exports = {
  mergeGroupData,
  filterGroupData
}
