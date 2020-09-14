export const OPR_REG_MATCH = {
  // 用于定位深度，$.相当于数据源根节点（root.）
  REG_RULEPATH: /^\$(\.\w+)+/g,
  // 小于。适用于数值大小或者数组/字符串的长度比较
  REG_LT: /^\$</g,
  // 大于。适用于数值大小或者数组/字符串的长度比较
  REG_GT: /^\$>/g,
  // 小于等于。适用于数值大小或者数组/字符串的长度比较
  REG_LTE: /^\$<=/g,
  // 大于等于。适用于数值大小或者数组/字符串的长度比较
  REG_GTE: /^\$>=/g,
  // 等于。默认等于条件，适用于数值大小或者数组/字符串的长度比较
  REG_EQUAL: /^\$=/g,
  // 不等于。适用于数值大小或者数组/字符串的长度比较
  REG_NOTEQUAL: /^\$!=/g,
  // 区间，适用于数值大小或者数组/字符串的长度是否满足该区间比较
  REG_BETWEEN: /^\$<>/g,
  // 源数据字段类型等于规则类型，则选中
  // 支持的类型string、number、boolean、object、array、function、sysmbol、undefined、null
  REG_EQUAL_TYPE: /^\$@/g,
  // 源数据字段类型不等于规则类型，则选中
  REG_NOTEQUAL_TYPE: /^\$!@/g,
  // 正则匹配符号，当前条件用正则表达式匹配
  REG_EXP: /^\$\$/g,
  // 与，默认
  REG_AND: /^\$&$/g,
  // 或，{Object} 条件满足其一即可，多用于mergeRule组合规则中使用
  REG_OR: /^\$\|$/g,
  // 子字段删除符，{Array} 数组中的value值为需要删除的子字段
  REG_DEL: /^\$\^$/g
}
