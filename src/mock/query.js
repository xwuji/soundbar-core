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
    'titles': [{
      'id': '665,666',
      '$^content': 'img'
    }, {
      'id': '667,668',
      '$|content': ['skuid', 'img']
    }],
    'skucards': {
      'type': '5'
    }
  },
  'filterRule': {
    '$^mayLikeProducts': {
      '$<groupId': '8414500',
      '$<<shopId': ['024100', '024112'],
      '$|': {
        'groupName': '今日推荐',
        'shopName': '戴尔商用商红专卖店'
      }
    },
    '$^recommendProducts': {
      '$>=leftStocks': '1000'
    },
    '$|': {
      'headInfo': {
        '$^hotProducts': '0'
      },
      'mayLikeProducts': {
        '$>timeBegin': '1550163689000'
      }
    }
  }
}
