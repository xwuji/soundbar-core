
## 查询附加符号
| 符号 | 定义  |
| ------ | ------ |
| $& | 与，默认 |
| $&#124; | 或，条件满足其一即可 |
| $^ | 非，剔除此条件下的当前数据 |
| $< | 小于，适用于数值或者数组的长度  |
| $> | 大于，适用于数值或者数组的长度  |
| $<= | 小于等于，适用于数值或者数组的长度 |
| $>= | 大于等于，适用于数值或者数组的长度  |
| $<> | 区间，适用于数值或者数组的长度  |

## 查询参数
### interface [array]
接口地址以及透传的参数，中间层会代理请求当前地址并透传参数，按照规则将处理的数据返回。支持请求多个资源合并成一个数据返回，合并的规则（待）。  
**url** [string] 接口地址，必传  
**params** [object] 接口相应的参数，默认为空
```json
{
"interface":[{
  "url": "https://api.xx.com/client.action1",
  "params":{
    "client": "wh5",
    "functionId": "list",
    "clientVersion": "10.0.0",
  }
},{
  "url": "https://api.xx.com/client.action2",
  "params":{
    "client": "wh5",
    "functionId": "author",
    "clientVersion": "10.0.0",
  }
},{
  //...
}]
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

### merge [object]
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
  "merge": {
    "titles": [{
      "id": "665,666",
      "$^content": "img"
    }, {
      "id": "667,668",
      "content": ["skuid", "img"]
    }],
    "skucards": {
      "des":{
        "type": "5"
      }
    },
    "scrollers": {
      "des":{
        "img": "xx.gov" 
      },
      "$|":{
        "des":{
          "$>=leftStock": "100"
        }
      }
    },
  }
}
```
注意：返回的原始数据设为`res`  
*titles分组*  
包含`res`中id为`'665,666'`且content不为`'img'`的标题  
且顺带看看有没有res中id为`'667,668'`且content为`'skuid'`或者`'img'`的标题，有就带着一起上车  
*skucards分组*  
包含`res.des`中type为5的子项目上车  
*scrollers分组*  
包含`res.des`中`img`为`xx.gov`的所有子项目  
或包含 `res.des.leftStocks`的数目大于100的  
以第一个满足条件的为最终上车对象  


### filter [object]
过滤筛选模块，可包含正向、反向过滤数据，可在`filterWithoutMerge`中配置是否要在原始数据中排除已经整合出来的数据。
规则为：
```javascript
{
  filter:{
    filterName: conditions
  }
}
```
**filterName**  [string]  
原始数据中存在的子项名称，对该子项进项处理  
例如，`mayLikeProducts`是原始数据中的猜你喜欢模块，已经存在的字段，那么我只需要其中特定条件的子数据，就可以在该字段`mayLikeProducts`上进行条件筛选。  
**conditions**  [object | boolean]  
`filter`的对象为数组类型，`conditions`的目标是对数组内的子项进行处理，`filter`的对象为非数组类型，`conditions`的目标是对该`filter`的对象自身进行处理。
简而言之，过滤对象本身为数组，则过滤条件适用于子项过滤，过滤对象为数值、字符串、布尔值、对象等则针对自身做过滤。

```json
{
  "filter": {
    "mayLikeProducts":{  
      "$<groupId": "8414500",
      "$<<shopId": ["024100","024112"],
      "$|": {
        "groupName": "今日推荐",
        "shopName": "戴尔商用商红专卖店"
      }
    },
    "recommendProducts":{  

      "$>=leftStocks": "1000" 
    },
    "$|":{

      "headInfo": {
        "$^hotProducts": "0" 
      },
      "mayLikeProducts": {
        "$>timeBegin": "1550163689000"  
      }
    }
  }
}
```
*mayLikeProducts*为数组满足以下条件,选择保留子项，剔除满足条件的子项为"$^mayLikeProducts"  
保留`groupId`小于`8414500`且`shopId`在`024100`和`024112`之间的子项目  
或者保留`groupName`为'今日推荐'且`shopName`为'戴尔商用商红专卖店'的子项目     

*recommendProducts*为对象,满足以下条件,选择剔除或者保留自身    
保留库存大于等于1000的`recommendProducts`自身，或者保留`headInfo`，只要子项`hotProducts`不为0  
保留`mayLikeProducts`，只要子项`timeBegin`大于`1550163689000`


以下这种情况，就是过滤掉自身。

```json
{
 "$^recommendProducts": true
}
```