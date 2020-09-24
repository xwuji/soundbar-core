import MergeCore from '@core/merge.js'
import ShakingCore from '@core/shaking.js'
import ExactGrabCore from '@core/exact.js'
/**
 * mergeGroupData、ShakingGroupData
 * @param {rules} 用户请求参数中的mergeRule或者ShakingRule 需求中间层结构出来入参
 * @param {sourceBody} 上游接口请求返回的原始数据
 * @returns {object}
 */
export default {
  MergeCore,
  ShakingCore,
  ExactGrabCore
}
