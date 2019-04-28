module.exports = {
  'queryKey': 'discoveryFanAreaList',
  'url': 'https://api.m.jd.com/client.action',
  'params': {
    'client': 'wh5',
    'functionId': 'discoveryFanAreaList',
    'clientVersion': '10.0.0'
  },
  'filterWithoutMerge': true,
  'mergeRule': {
    // 满足条件的合并到自定义字段中
    'skusOrImgs': {
      '$.result.list.description': {
        'type': '3',
        '$|': {
          'type': '2'
        }
      }
    },
    'authorDetailFloors': {
      '$.result.list': {
        '$$floorAppearance': ['authorDetailFloor', 'g']
      }
    }
  },
  'filterRule': {
    // 按照源字段顺序进行保留筛选
    // 键值对的布尔值true或者false表示该字段是否保留
    // 如果要和原数据的布尔值进行比较，对整个子项进行筛选，使用字符串形式的'true'或者'false'
    '$.code': true,
    // **** list是数组类型，其后条件是针对子项进项筛选 ****
    '$.result.list.description': {
      '$!=type': '11'
    },
    '$.result.list': {
      // 复杂类型建议使用反向保留规则 不然需要保留的项目需要每项都写
      // 目前条件筛选只针对于数组，对象类型非条件筛选，也就是说对象中字段要么保留要么删除，不存在满足条件才保留删除
      // 条件筛选，满足Key,Value相互匹配，筛选子项，正向筛选或者反向筛选
      '$!=floorApearrence': 'similarArticleFloor_2' // 子项的中有floorApearrence且值不为similarArticleFloor_2或者没有floorApearrence，保留子项
      // '$!=description': 'undefined' // 子项的中有description，保留该子项
      // 'floorApearrence': 'similarArticleFloor_2' // 子项的中有floorApearrence且值为similarArticleFloor_2，保留子项
      // 非条件筛选，满足Key即可，筛选该字段，正向筛选或者反向筛选
      // '$^': ['floorApearrence'] // 删除子项中的floorApearrence字段，如果有的话
      // 'floorApearrence': true // 只保留子项中的floorApearrence字段，子项中没有，则删除子项
      // 注意区别
      // 'floorApearrence': 'true' // 子项中的floorApearrence字段值为'true'，则保留该子项
    },
    // **** config 是对象类型，其后条件对自身进行筛选 ****
    '$.result.config': {
      '$^': ['footer'] // 只删除config中该字段数据,无论其值是什么
      // 'footer': true // 只保留config中该字段数据,无论其值是什么
    },
    '$.result.pageView': true,
    '$.result.pageViewStr': true,
    '$.result.pin': true,
    '$.result.unionId': true
  }
}
