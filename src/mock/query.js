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
    'auhtors': {
      '$.result.list.description': {
        'type': '11',
        '$>age': '20',
        '$!=skuid': '10023',
        '$$detail': '/^jdsku/g',
        '$|': {
          'type': '12',
          '$>age': '10'
        }
      }
    }
  },
  'filterRule': {
    // 针对统一详情页接口
    '$.result.list': {
      // 'floorApearrence': 'floorAuthor',
      '$!=floorApearrence': 'floorLable'
    },
    '$.result.config': {
      '$^': ['footer']
    }
  }
}
