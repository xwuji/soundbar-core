<img src="https://aszero.oss-cn-shanghai.aliyuncs.com/imgs/soundbar-logo.png" style="width: 500px;" />


在 `REST` 中，资源的返回结构与返回数量是由服务端决定；在`GraphQL`，服务端只负责定义哪些资源是可用的，由客户端自己决定需要得到什么资源,所谓的api查询。我们的想法是在`GraphQL`中服务端决定的资源，其实也是通过客户端所给予的信息来进行反馈（资源定位和http的动作），如果客户端和服务端之间有一套约定，这个约定框架下客户端给的信息足够多，那么也可以让服务端来满足客户端的查询需求，即按需请求和按需返回，这个和`GraphQL`的思想是一致的。 至于为什么不统一使用`GraphQL`，每个公司的大背景下会有每种不同的实际情况，满足多端的需求又尽快的让服务端和客户端每个人都熟悉`GraphQL`，成本比较大；当然在有条件的额情况下统一使用GraphQL是最好的。所以我们就想用中间层和传统的`REST`来改造现有数据接口，又符合`GraphQL`的思想，在客户端的查询条件下，满足合并模块数据、过滤筛选冗余数据，选取特定数据的需求。

**举个栗子**：前端A想到从后端B那边获取想要的数据，通常会问B要对应的接口服务以及接口文档（出入参和边界情况），如果这个时候A发现B给到的数据中包含需要的数据但是并不能立马可以使用，需要层层解析甚至还需要经过复杂的非业务逻辑运算，不巧的是参与的前端**A1,A2,A3...An**也在使用这个接口，产生的问题是一样的，于是A会去找B协调接口的简化，但是这时候B的该技术评审已定，框架已经定型，排期已过，甚至一句‘不好做哎’ 就可以把A友善的拒绝，那么**A1,A2...An**就商量不要重复造车轮，逻辑和解析运算大家写一个公共组件或者方法，但是问题又来了，每个人调用接口使用的具体数据都不一样，公共组件方法也只能浅共，还是要自己去写一部分看似差异实则无区别的方法。那么A们就想着拉服务端业务大接口，自己在中间的服务层去分装小接口，按照自己的规则去‘操控’中间的服务层给自己提供想要的数据，就像回音壁一样返回到自己‘内心’的声音。



#### 安装

```shell
npm install @soundbar/core --save
```
```shell
yarn add @soundbar/core
```

#### 使用

##### 引入解释器功能类

```js
const { shakingCore, mergeCore } = require("@soundbar/core")
```

##### 实例化并入参

```js
//@Param {mergeRule}  Object 用户请求参数中的mergeRule
//@Param {shakingRule} Object  用户请求参数中的shakingRule
//@Param {sourceDB}  Object 上游接口请求返回的原始数据
const mergeCore = new mergeCore(mergeRule, sourceDB)
const shakingCore = new shakingCore(shakingRule, sourceDB)
```

##### 获取处理的数据

```js
const mergeGroupData = mergeCore.getmergeGroup
const shakingGroupData = shakingCore.getshakingGroup
```



#### 基本示例

```js
const { shakingCore, mergeCore } = require("@soundbar/core")

const mergeCore = new mergeCore(mergeRule, sourceDB)
const mergeGroupData = mergeCore.getmergeGroup
console.log(JSON.stringify(mergeGroupData))

const shakingCore = new shakingCore(shakingRule, sourceDB)
const shakingGroupData = shakingCore.getshakingGroup
console.log(JSON.stringify(shakingGroupData))
```


## 规则操作符



#### 核心规则

> 以字段本身的值或者字段的子字段值，来决定当前字段的选中与否。被选中的字段在shakingRule中被保留，在mergeRule中被提取合并。



#### 定位操作符

| 符号   | 定义                                        |
| ------ | ------------------------------------------- |
| **$.** | 用于定位深度，$.相当于数据源根节点（root.） |

#### 关系操作符

| 符号    | 定义                                                         |
| :------ | ------------------------------------------------------------ |
| **$<**  | 小于。适用于数值大小或者数组/字符串的长度比较                |
| **$>**  | 大于。适用于数值大小或者数组/字符串的长度比较                |
| **$<=** | 小于等于。适用于数值大小或者数组/字符串的长度比较            |
| **$>=** | 大于等于。适用于数值大小或者数组/字符串的长度比较            |
| **$=**  | 等于。默认等于条件，可不写。适用于基本类型的比较。           |
| **$!=** | 不等于。适用于基本类型的比较                                 |
| **$<>** | 区间，适用于数值大小或者数组/字符串的长度是否满足该区间比较  |
| **$@**  | 源数据字段类型**等于**规则类型，则选中，类型`string`、`number`、`boolean`、`object`、`array`、`function`、`sysmbol`、`undefined`、`null` |
| **$!@** | 源数据字段类型**不等于**规则类型，则选中                     |
| **$$**  | 正则匹配符号，当前条件用正则表达式匹配                       |

#### 逻辑操作符

独立使用，不与任何字符连接使用，表示与平级字段之间的逻辑关系

| 符号    | 定义                                                         |
| ------- | ------------------------------------------------------------ |
| **$&**  | 与，默认                                                     |
| **$\|** | 或，{Object} 条件满足其一即可，多用于mergeRule组合规则中使用 |

#### 特殊操作符

此操作符并不定义核心规则，即它不影响字段本身的取舍，只改变字段本身的值

| 符号   | 定义                                                     |
| ------ | -------------------------------------------------------- |
| **$^** | 子字段删除符，{Array}  数组中的value值为需要删除的子字段 |



**$&**  {Object}	逻辑操作符，查询组里条目之间的关系默认是与的关系，无需写入

```json
# 当B和C都满足条件，选中A字段
# 等价于`B & C`
{
  "A": {
    "B": "conditionB",
    "C": "conditionC"
  },
}
#等价于
{
  "A": {
    "B": "conditionB",
    "$&":{
  		"C": "conditionC"
    }
  },
}
```



**$|** {Object}	逻辑操作符，查询组里平级字段之间是或的关系，注意只有在merge规则里使用或逻辑，shaking规则里不必使用或关系。

```json
# 当B满足条件或者C和D同时满足条件，选中A字段
# 等价于`B | ( C & D )`
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



关系操作符`=` `!=`适用于数字、数组长度、字符串的比较，而`>` ` <`  `>=` `<=`	只适用于适用于数字、数组长度比较。区间比较用`[]`，比如匹配值是1到1000的字段，那么可以这么表示`[1,1000]`。

```json
# 假设B为数字，C为数组，
# 那么A字段中数字B大于等于100且数组C的长度在1到100区间，选中A字段。
{
  "A": {
    "$>=B": 100,
    "$<>C": [1,100],
  }
}

#如果B满足`conditionB`，而且C（数字、数组的长度、字符串）不等于`conditionC`，那么提取A段数据。
{
  "A": {
    "B": "conditionB",
    "$!=C": "conditionC"
  }
}
```



**$@** 关系操作符，对当前字段进行类型判断，类型值不区分大小写，

常用类型`string`、`number`、`boolean`、`object`、`array`、`function`、`sysmbol`、`undefined`、`null`

```json
# 当C的为string类型，选中A
{
  "A": {
    "$@C": "string"
  }
}
# 如果C为多种类型
{
  "A": {
    "$@C": ["string","number","array"]
  }
}
```



**$!@** 关系操作符，对当前字段进行类型取反判断，类型值不区分大小写

```json
# 当C字段不等于undefined，即字段值存在，选中A
{
  "A": {
    "$!@C": "undefined"
  }
}
# 如果C不为多种类型
{
  "A": {
    "$!@C": ["undefined","null"]
  }
}
```



**$$** {Array}	关系操作符，表示用正则表达式对当前字段进行匹配

语法： `"$$key": [pattern,flag]`

`pattern`为正则表达式	{String}，`flag`为正则标志	{String}

```json
# 如果B满足`conditionB`，且C(一般是字符串)匹配正则规则，选中A字段
{
  "A": {
    "B": "conditionB",
    "$$C": ["/condition(?:C|D)/","g"]
  }
}
```



**$^**  {Array}	特殊操作符，数组中的value值为需要删除的子字段，针对对象字面量和数组类型有效，其他类型忽略该规则。

```json
# 假设A是对象字面量或者数组类型，删除A中的C和D字段
{
  "A": {
    "$^": ["C","D"]
  }
}
```

```json
{
 # list是数组，删除数组子项是对象字面量里的"floorApearrence"的字段
  "$.result.list": {
    "$^": ["floorApearrence"]
  }
}
```

```json
{
  # config是对象字面量，删除config中"footer"和"header"字段
  "$.result.config": {
    "$^": ["footer","header"] 
  }
}
```





**$.**  定位操作符，理解成`this.`，从数据源结构的根目录查找，不使用该符号默认根目录。

```json
#	路径：`$.prarent.child`表示，在根目录下查找`parent` 
# 查找规则：`parent`是对象字面量类型则继续查找子字段`child`；`parent`是数组类型则继续查找`parent`数组每个值里的`child`
# 异常处理：在合并规则中，如果整个链式查找出错或者找不到期望的筛选深度，则废弃该字段规则。
#  满足B等于`conditionB`的`child`被选中，合并到`mergeGroupA`中
{
  "mergeGroupA": {
    "$.prarent.child": {	
      "B": "conditionB",
    }
  }
}
```

找不到`parent`或者`child`,`mergeGroupA`就会被废弃，返回数据中不会存在此字段。`root > prarent > child` 中满足B等于`conditionB`的child会被合并到`mergeGroupA`中。



**注意：**

- 逻辑符号 `$&`  `$|` `$^` 表达逻辑关系时候，符号都需要作为单独的Key值写,以便于分组，**不可**和字段连在一起写，如 `$|root`。
- 为了兼顾性能，`$=` `$!=` 只适用于简单类型的条件比较，字符串，数值，布尔，undefined，null等，不用于复杂类型的判断。





## 查询入参



### url [string]

数据接口地址，必传。中间层会代理请求当前地址，并将处理的数据返回。

```json
{
  "url": "https://api.xx.com/client.action1",
}
```



### params [object]

数据接口必要的入参，默认为空。

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



### shakingWithoutmerge [boolean]

**shaking规则**的数据是否要排除**merge组合规则**的里的数据。默认值，`false`。如果没有此字段，有需要情况下需手动在**shaking规则**里删掉已经merge组合出来的数据。
理解，数据源为`A`，shaking规则的数据为`F`，merge组合规则的数据为`M`，我们会在`A-M`的基础上再去得到`F`，也就是说`F∩M`为空。`F∩M`为空可以避免特定业务场景下数据的冗余。我们的目标就是在当前业务场景下，前端接收的数据不冗余一个字段。

```json
{
  "shakingWithoutmerge": true,
}
```



### mergeRule [object]

需要组合出来的数据规则，没有提取组合的需求则不用传该字段

```js
{
  "mergeRule":{
    [defineGroupName]: {
    	[Location-1]:{Conditions},
    	[Location-2]:{Conditions},
    	// ...
    }
    //...
  }
}
```

##### defineGroupName [String]

提取组合的数据塞入分组名称。我们会把你提取出来组合的数据，以你定义的组名返回给你。

理解，你可能需要把所有的符合条件的**商品**整合到`mySkus`的分组中，你接收到返回的数据体`res`就可以从`res.mergeRule.mySKus`里取出你期望已经组合好的数据。

这个提取合并工作交给我们，你负责直接拿数据渲染。

##### Location [String]

用`$.`操作符进行数据定位



展示伪代码段用于理解

```json
# Req Params
{
  "mergeRule": {
    "mySkus": {
      "$.result.skusList":{
        "$!@img": "undefined",// img字段存在
        "$>=leftStock": "100" // 且当前sku库存高于100
      }
    }
  }
}
# Res Data
{
  "mergeGroup": {
    "mySkus": [{
      "skuId": "9601362795",
      "img":"//m.360buyimg.com/babel/jfs/t1/135284/1/5607/5270/5f2199d5E9892095e/a288c3c6dae5f6dc.jpg!q70.jpg", //符合条件
      "leftStock": 9231, //符合条件
      "topicName": "11.11购物节"
      },{
        "skuId": "92013127120",
				"img":"//m.360buyimg.com/babel/jfs/t1/133634/14/5890/22031/5f27781aEaba88fe8/8d9da3247fb0e358.png", //符合条件
        "leftStock": 188, //符合条件
        "topicName": "618购物节"
      },
      //...
   ]
  }
}
```



### shakingRule [object]

过滤模块，基于原始接口数据进行shaking，**命中规则的集合会被shaking掉**。

也可以用 `$^`操作符无需规则"暴力"shaking掉子字段  。可在`shakingWithoutmerge`中配置是否要在原始数据中排除已经整合出来的数据。 语法为：

```json
{
  "shakingRule":{
    [location]:{
      [key]: "conditions"
    }
  }
}
```

##### shakingName [string]

原始数据中存在的子项字段名称，对该子项进项处理。

##### conditions [object | boolean]

`shaking`的对象为数组类型，`conditions`的目标是对数组内的子项进行处理。 `shaking`的对象为非数组类型，`conditions`的目标是对该`shaking`的对象自身进行处理。 简而言之，过滤对象本身为数组，则过滤条件适用于子项过滤，过滤对象为数值、字符串、布尔值、对象等则针对自身做过滤。

**注意：**

- 过滤规则内不支持$|"或"规则，因为没有必要且不符合认知
- 过滤规则支持数组内子项过滤，但不支持数组内子项的子项过滤， $.a.b.c 即c才能是数组,如其他需求配合merge使用



shaking规则分为**条件过滤**和**非条件过滤**

**条件过滤：** 根据条件Condition以及操作符规则进行过滤，不会一刀切。

```json
"$.result.list": {
  "floorAppearance": ["articleDetailFloor_1", "similarArticleFloor_2"]  
}
```

**非条件过滤：**没有任何条件判断，找到即删除整个字段，一刀切"暴力"shaking，特殊操作符`$^`。

```json
"$.result.config": {
  "$^": ["footer"] // 删除config中footer字段数据,无论其值是什么
},
```



##### 示例

```json
# Res Params
# list是数组类型，其后条件是针对子项是对象字面量的shaking
# shaking掉`list`中含有`floorApearrence`的子项，shaking的条件是其`floorApearrence`等于`articleDetailFloor_1`或者`similarArticleFloor_2`
"shakingRule":{
  "$.result.list": {
    "floorAppearance": ["articleDetailFloor_1", "similarArticleFloor_2"]
  }
}
```

```json
# Res Params
# list是数组类型，其后条件是针对子项进项筛选
# shaking掉`list`中含有`floorApearrence`的子项，shaking的条件是其`floorApearrence`不等于`authorInfoFloor_1`
"shakingRule":{
  "$.result.list": {
    "$!=floorAppearance": "authorInfoFloor_1"
  },
}
```

```json
# Res Params
# shaking掉list中没有`description`的子项
"shakingRule":{
  "$.result.list": {
    "$@description": "undefined"
  }
}
```

```json
# Res Data
"shakingGroup":{
  # ...
}
```

### grabExactRule [object]
精确提取字段规则，通过路径选取对象，然后对对象进行字段提取。如果该对象是数组则对该数组子元素对象进行字段提取，如果是对象字面量则直接进行提取。**提取后的json结构和原数据保持一致**，按照原先的取字段方式进行操作即可。  
```json
"exactGrabRule": {
  [dotPath]: [fields]
}
```
#### dotPath [string]
点附路径 `$.a.b.c`
#### fields [array]
提取的字段名称集合 `[field1,field2,...fieldn]`

举个例子
```json
"exactGrabRule": {
    "$.result": ["pageView", "pin"],
    "$.result.list": ["typeDes", "typeFlag", "exactData", "floorAppearance"], 
    "$.result.config.head": ["shareInfo"]
  },
```
上面的例子会提取原数据中`result`中的`pageView`和`pin`字段,`result.config.head中`的`shareInfo`字段,`result.list`是个数组，所以会进行一层遍历，提取其每个子元素的`shareInfo`字段，没有则忽略。

以下为返回结果，json所有保留的字段结构和原数据一致。其他所有冗余字段全部被过滤掉了。
```json
{
  "result": {
    "pageView": 322,
    "pin": "J/Y/d9LNZtlCvXGBvbhdMg==",
    "list": [{
      "typeDes": "object",
      "typeFlag": {},
      "exactData": "奥斯卡很大猴神大叔的",
      "floorAppearance": "style_1"
    }, {
      "typeDes": "array",
      "typeFlag": [],
      "exactData": "快乐哈第三方好地方",
      "floorAppearance": "style_2"
    }],
    "config": {
      "head": {
        "shareInfo": {}
      }
    }
  }
}
```

**完整单接口请求入参示例：**

```js
module.exports = {
  "queryKey": "discoveryFanAreaList", //可不传 多接口查询使用
  "url": "https://api.m.jd.com/client.action",
  "params": {
    "client": "wh5",
    "functionId": "discoveryFanAreaList",
    "clientVersion": "10.0.0"
  },
  "shakingWithoutmerge": true,
  "mergeRule": {
    "skusOrImgs": {
      "$.result.list.description": {
        "type": "3",
        "$|": {
          "type": "2"
        }
      }
    },
    "authorDetailFloors": {
      "$.result.list": {
        "$$floorAppearance": ["authorDetailFloor", "g"]
      }
    }
  },
  "shakingRule": {
    "$.result.list": {
      "floorAppearance": ["articleDetailFloor_1", "similarArticleFloor_2"]
    },
    "$.result.config": {
      "$^": ["head"]
    },
    "$.result": {
      "$^": ["pageView", "pageViewStr"]
    }
  }
}
```





## 多接口查询

多接口查询的时候，需要增加每个接口查询的关键字，以便于返回合并数据后的读取。

### queryKey [string]

查询关键字，用于多接口查询返回使用，单接口可选，**多接口必传**。

**完整多接口请求示例：**

```js
module.exports = [{
  "queryKey": "discoveryFanAreaList",
  "url": "https://api.m.jd.com/client.action",
  "params": {
    "client": "wh5",
    "functionId": "discoveryFanAreaList",
    "clientVersion": "10.0.0"
  },
  "shakingWithoutmerge": true,
  "mergeRule": {},
  "shakingRule": {}
}, {
  "queryKey": "discoveryGuessLike",
  "url": "https://api.m.jd.com/client.action",
  "params": {
    "client": "wh5",
    "functionId": "discoveryGuessLike",
    "clientVersion": "10.0.0"
  },
  "shakingWithoutmerge": false,
  "mergeRule": {},
  "shakingRule": {}
}, {
  "queryKey": "discoveryAuthorHome",
  "url": "https://api.m.jd.com/client.action",
  "params": {
    "client": "wh5",
    "functionId": "discoveryAuthorHome",
    "clientVersion": "10.0.0"
  },
  "shakingWithoutmerge": false,
  "mergeRule": {},
  "shakingRule": {}
}]
```


