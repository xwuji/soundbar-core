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
    // 满足条件的保留然后合并
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
        '$$floorAppearance': '/authorDetailFloor/g'
      }
    }
  },
  'filterRule': {
    '$.result.list': {
      '$!=floorApearrence': 'similarArticleFloor_2'
    },
    '$.result.config': {
      '$^': ['footer']
    }
  }
}
