module.exports = {
  /**
   * 返回数组子元素中包含当前key值的所有子项
   * @param {array} arrGroup
   * @param {string} key
   * @returns {array}
   */
  fetchOutKeyChild (arrGroup, key) {
    let resGroup = []
    resGroup.mutilRes = true // 表示选择出来了多组数据
    // arrGroup的所有key字段产生新集合
    arrGroup.map((group, index) => {
      if (isUndefined(group[key])) return
      resGroup.push(group[key])
    })
    return resGroup // [mutilRes: true,[],[]]
  }
  /**
   * 根据运算符进行比较计算
   * @param {string | number} x
   * @param {string | number} y
   * @param {string} mSymbol 运算符
   * @returns
   */
  switchMathCompare (x, y, mSymbol) {
    try {
      switch (mSymbol) {
        case 'lt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x < y
        case 'lte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x <= y
        case 'gt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x > y
        case 'gte':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x >= y
        case 'notEqual':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x !== y
        case 'bt':
          if (Object.is(+x, NaN) || Object.is(+y, NaN)) return false
          else return x > y[0] && x < y[1]
        case 'reg':
          const reg = new RegExp(y[0], y[1])
          return !!x.match(reg)
        default:
          return x === y
      }
    } catch (error) {
      return false
    }
  }, /**
  * 返回源数据和条件逐条比较的结果
  * @param {array | object} sourceData 路径匹配到的原数据集合
  * @param {string} key 条件集合中的单条key
  * @param {*} value 条件集合中的单条value
  * @param {*} mSymbol 运算符
  * @returns {boolean}
  */
  compareResult (sourceData, key, value, mSymbol) {
    const sourcePosValue = sourceData[key]
    if (!sourcePosValue) return false
    // 条件对比支持数组的长度和数值和字符串
    if (isArray(sourcePosValue)) {
      if (typeof value !== 'number') throw Error('Arrays condition value not a number')
      return this.switchMathCompare(sourcePosValue.length, value, mSymbol)
    } else if (typeof sourcePosValue === 'string' || typeof sourcePosValue === 'number') {
      return this.switchMathCompare(sourcePosValue, value, mSymbol)
    } else {
      return false
    }
  }
}
