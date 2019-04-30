
## 查询附加符号定义
| 符号 | 定义  |
| ------ | ------ |
| $& | 与，默认，独立逻辑符号，不与任何字符连接使用 |
| $&#124; | 或，条件满足其一即可，merge专用，独立逻辑符号，不与任何字符连接使用 |
| $^ | 非，剔除此条件下的当前数据，独立逻辑符号，不与任何字符连接使用 |
| $. | 定位深度，类似于this. 只适用于mergeRule中|
| $< | 小于，适用于数值或者数组的长度  |
| $> | 大于，适用于数值或者数组的长度  |
| $<= | 小于等于，适用于数值或者数组的长度 |
| $>= | 大于等于，适用于数值或者数组的长度  |
| $= | 等于，默认等于条件，不必写 |
| $!= | 不等于，不等于条件成立 |
| $<> | 区间，适用于数值或者数组的长度  |
| $$ | 正则匹配符号，表示当前条件为正则表达式 |



**$&**  查询组里条目之间的关系默认是与的关系，当B且C满足条件，A才满足条件。

```json
{
  "A": {
    "B": "conditionB",
    "C": "conditionC"
  },
}
```
等价于`B & C`

**$|**  查询组里条目之间的是或的关系，当B或C且D满足条件，A才被提取出来，注意只有在merge规则里使用或逻辑，filter规则里不必使用或关系。

```json
{
  "A": {
    "B": "conditionB",
    "$|": {
      "C": "conditionC",
      "D": "conditionC"
    }
  }
}
```
等价于 `B | ( C & D )` 

**$^**  满足B的情况下过滤掉A字段中的C和D字段，再提取出A，`$^`的value为数组，数组中的值为需要排除的字段。   
```json
{
  "A": {
    "B": "conditionB",
    "$^": ["C","D"]
  }
}
```
过滤A字段中的C和D字段
```json
{
  "A": {
    "$^": ["C","D"]
  }
}
```
**$< $<= $> $>= $< $<>**   适用于数值或者数组长度的比较
```json
{
  "A": {
    "$>=B": 100,
    "$<>C": [1,100],
  }
}
```
假设B为数值，C为数组，那么A字段中的B大于等于100且C的长度在1到100区间，就提取A字段数据。  

**$!=**   不等于符号
```json
{
  "A": {
    "B": "conditionB",
    "$!=C": "conditionC"
  }
}
```
如果B等于`conditionB`，且C不等于`conditionC`，那么提取A段数据。  

**$$**   正则匹配符号，后面的筛选条件为正则表达式数组，数组第一项为正则表达式，第二项为标志；原数据中的数据会和正则表达式进行match匹配。  
语法：  ```'$$key': [pattern[,flag]]```
```json
{
  "A": {
    "B": "conditionB",
    "$$C": ["/condition(?:C|D)/","g"]
  }
}
```
如果B等于`conditionB`，且C中含有`conditionC`或者`conditionD`，那么提取A段数据

**$.**  在`mergeRule`中定位深度，类似于this.，则只适用于<mark>mergeRule</mark>中进行查找筛选然后合并数据，不使用的该符号默认为原数据结构的根目录查找起点。
```json
{
  "mergeGroupA": {
    "$.prarent.child"{
      "B": "conditionB",
    }
  }
}
```
`$.prarent.child`表示，在根目录下查找`parent`  
1.`parent`是`对象`则继续查找`parent`下的`child`    
2.`parent`是`数组`则继续查找`parent`里有`child`的子项  
3.如果整个链式查找出错或者找不到期望的筛选深度，则废弃该合并字段，找不到`parent`或者`child`,mergeGroupA就会被废弃，返回数据中不会存在此字段  
4.`root > prarent > child` 中满足B等于`conditionB`的`child`会被合并到`mergeGroupA`中


  

**注意：**  
1. 逻辑符号`或` `非` `且`表达逻辑关系时候，符号`$|` `$^` `$&`都需要<mark>作为单独的Key值写,</mark>，以便于分组，不可和字段连在一起写。
2. 逻辑查询，为了兼顾性能，只适用于简单类型的条件比较，字符串，数值，布尔，undefined,null等，不适用于复杂类型的判断。例如以上的`condition`条件可以为字符串，数值，布尔值，空等，不可以为对象，函数，数组。


## 查询参数
### url [string]
接口地址，必传。中间层会代理请求当前地址，按照规则将处理的数据返回，必要时需要传`params`作为透传参数。
```json
{
  "url": "https://api.xx.com/client.action1",
}
```
### params [object]
接口相应的参数，默认为空。
```json
{
  "url": "https://api.xx.com/client.action1",
  "params":{
    "client": "wh5",
    "functionId": "list",
    "clientVersion": "10.0.0",
  }
}
```
### filterWithoutMerge [boolean]
输出的过滤模块(filter)中是否要排除掉整合模块中(merge)的数据,默认值`true` 。   
例如，所有数据为`A`，过滤数据为`F`，整合数据为`M`，我们会在`A`-`M`的基础上再去得到`F`，也就是说`F`&#8745;`M`为空。
```json
{
  "filterWithoutMerge": true,
}
```

### mergeRule [object]
需要整合的数据规则，不需要整合则不用传该参数
规则为：
```javascript
{
  merge:{
    mergeModuleName: conditions
  }
}
```
**mergeModuleName**  [string]  
分组的名称，例如你可能需要把所有的标题整合到`titles`的分组中，以便于你接收数据时候可以从`res.merge.titles`里取出你期望整合过的数据。  
**conditions**  [array | object]  
分组整合查询条件,以原始数据的根节点为查询源点

```json
{
  "mergeRule": {
    "titles": {
      "$.result.list":{
        "id": ["665,666","667,668"],
        "$!=content": "img"
      }
    },
    "skucards": {
      "$.result.des":{
        "type": "5"
      }
    },
    "scrollers": {
      "$.result.skus":{
        "img": "xx.gov",
        "$|":{
          "$>=leftStock": "100"
        }
      }
    }
  }
}
```
假设返回的原始数据设为`res`  
*titles分组*  
整合`res.result.list`自身或者子项中id为'665,666'或者'667,668'且content不为'img'的集合。  
*skucards分组*    
整合`res.result.des`自身或者子项中type为5的集合。    
*scrollers分组*  
整合`res.result.skus`自身或者子项中'img'为'xx.gov'，或自身或者子项的'leftStocks'的数目大于100的集合。   


### filterRule [object]
过滤模块，基于原始接口数据进行筛选，满足条件的集合会被**过滤掉**。可在`filterWithoutMerge`中配置是否要在原始数据中排除已经整合出来的数据。
语法为：
```javascript
{
  filterRule:{
    path:{
      filterName: conditions
    }
  }
}
```
**filterName**  [string]  
原始数据中存在的子项字段名称，对该子项进项处理。    
**conditions**  [object | boolean]  
`filter`的对象为数组类型，`conditions`的目标是对数组内的子项进行处理。
`filter`的对象为非数组类型，`conditions`的目标是对该`filter`的对象自身进行处理。
简而言之，过滤对象本身为数组，则过滤条件适用于子项过滤，过滤对象为数值、字符串、布尔值、对象等则针对自身做过滤。


**注意：**
1. 过滤规则内不支持$|'或'规则，因为没有必要且不符合认知
2. 过滤规则支持数组内子项过滤，但不支持数组内子项的子项过滤， $.a.b.c 即c才能是数组,如其他需求配合merge使用

`filter`过滤规则分为`条件过滤`和`非条件过滤`：  
**条件过滤：** 只针对于数组，对象类型，满足Key,Value相互匹配的条件产生过滤处理。  
```javascript
'$.result.list': {
  'floorAppearance': ['articleDetailFloor_1', 'similarArticleFloor_2']  
}
```
**非条件过滤：** 对象中字段，没有任何条件判断，找到次过滤字段即过滤。
```javascript
'$.result.config': {
  '$^': ['head'] // 删除config中footer字段数据,无论其值是什么
},
```

过滤`list`中有`floorApearrence`的字段，且值等于` articleDetailFloor_1`和等于`similarArticleFloor_2`的子项。

```javascript
{
    // **** list是数组类型，其后条件是针对子项进项筛选 ****
    '$.result.list': {
      'floorAppearance': ['articleDetailFloor_1', 'similarArticleFloor_2']
    },
}
```
过滤`list`中有`floorApearrence`的字段，且值不等于` articleDetailFloor_2`都过滤掉。  

```javascript
{
    // **** list是数组类型，其后条件是针对子项进项筛选 ****
    '$.result.list': {
      '$!=floorAppearance': 'similarArticleFloor_2'
    },
}
```
过滤`list`中没有`description`的子项

```javascript
{
  // **** list是数组类型，其后条件是针对子项进项筛选 ****
  '$.result.list': {
    'description': 'undefined'
  }
}
```
过滤`list`中含有`floorApearrence`字段的所有子项
```javascript
{
  // **** list是数组类型，其后条件是针对子项进项筛选 ****
  '$.result.list': {
    '$^': ['floorApearrence']
  }
}
```

过滤`config`中`footer`和`header`字段数据,无论其值是什么
```javascript
{
  // **** config 是对象类型，其后条件对自身进行筛选 ****
  '$.result.config': {
    '$^': ['footer','header'] 
  }
}
```


**完整单接口请求：**
```javascript
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
    '$.result.list': {
      'floorAppearance': ['articleDetailFloor_1', 'similarArticleFloor_2']
    },
    '$.result.config': {
      '$^': ['head']
    },
    '$.result': {
      '$^': ['pageView', 'pageViewStr']
    }
  }
}

```


## 多接口查询
多接口查询的时候，需要增加每个接口的查询的关键字，以便于返回合并数据后的读取。
### queryKey [string]
查询关键字，用于多接口查询返回使用，单接口可选，多接口必传。  
**完整多接口请求示例：**
```javascript
module.exports = [{
  'queryKey': 'discoveryFanAreaList',
  'url': 'https://api.m.jd.com/client.action',
  'params': {
    'client': 'wh5',
    'functionId': 'discoveryFanAreaList',
    'clientVersion': '10.0.0'
  },
  'filterWithoutMerge': true,
  'mergeRule': {
  },
  'filterRule': {
  }
}, {
  'queryKey': 'discoveryGuessLike',
  'url': 'https://api.m.jd.com/client.action',
  'params': {
    'client': 'wh5',
    'functionId': 'discoveryGuessLike',
    'clientVersion': '10.0.0'
  },
  'filterWithoutMerge': false,
  'mergeRule': {
  },
  'filterRule': {
  }
}, {
  'queryKey': 'discoveryAuthorHome',
  'url': 'https://api.m.jd.com/client.action',
  'params': {
    'client': 'wh5',
    'functionId': 'discoveryAuthorHome',
    'clientVersion': '10.0.0'
  },
  'filterWithoutMerge': false,
  'mergeRule': {
  },
  'filterRule': {
  }
}]
```
