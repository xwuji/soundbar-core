module.exports = {
  'queryKey': 'discoveryFanAreaList',
  'url': 'https://api.m.jd.com/client.action',
  'params': {
    'client': 'wh5',
    'functionId': 'discoveryFanAreaList',
    'clientVersion': '10.0.0'
  },
  'exactGrabRule': {
    '$.result': ['pageView', 'pin'],
    '$.result.list': ['typeDes', 'typeFlag', 'exactData', 'floorAppearance'], // 后期针对数组增加分段查询模拟分页 { pageNum:1, pageSize: 20}
    '$.result.config.head': ['shareInfo']
  },
  // 'filterWithoutMerge': true,
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
  // 过滤规则
  // 过滤规则内不支持【$|'或'】规则，因为没有必要且不符合认知
  // 过滤规则支持数组内子项过滤，但不支持数组内子项的子项过滤 $.a.b.c 即c才能是数组,其他需求配合merge使用
  'shakingRule': {
    // 按照源字段顺序进行过滤
    // 键值对的布尔值true或者false表示该字段是否保留
    // 如果要和原数据的布尔值进行比较，对整个子项进行筛选，使用字符串形式的'true'或者'false'
    // **** list是数组类型，其后条件是针对子项进项筛选 ****
    '$.result.list': {
      // 复杂类型建议使用反向过滤规则
      // 目前条件过滤只针对于数组，对象类型非条件筛选，也就是说对象中字段要么保留要么删除，不存在满足条件才处理
      // 条件筛选，满足Key,Value相互匹配，筛选子项，正向筛选或者反向筛选
      '$@typeFlag': ['object', 'array', 'boolean'] // 过滤list下面子元素，条件为其字段typeFlag类型是'object', 'array','boolean'的
      // 'floorAppearance': ['articleDetailFloor_1', 'similarArticleFloor_2'] // 过滤list下面子元素，条件为其字段floorApearrence值为articleDetailFloor_1或similarArticleFloor_2
      // 'floorApearrence': ['similarArticleFloor_2','similarArticleFloor_3'] // 过滤list下面子元素，，条件为其字段floorApearrence值为similarArticleFloor_2或者similarArticleFloor_3
    },
    // **** config 是对象类型，其后条件对自身进行筛选 ****
    '$.result.config': {
      '$^': ['head'] // 删除config中footer字段数据,无论其值是什么
    },
    // '$.result.config.footer': false
    '$.result': {
      '$^': ['pageView', 'pageViewStr']
    }
  }
}
