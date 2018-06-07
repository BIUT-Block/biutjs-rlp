<a name="SECJS-RLP"></a>

* * *
## SECRlpEncode

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

**Kind**: global class

* [SECRlpEncode](#SECRlpEncode)
    * [new SECRlpEncode(config)](#new_SECRlpEncode_new)
    * [.encode(input, buffer, offset)](#SECRlpEncode+encode) ⇒ <code>Buffer</code>
    * [.decode(input, start, end)](#SECRlpEncode+decode) ⇒ <code>Array</code>
    * [.getLength(input)](#SECRlpEncode+getLength) ⇒ <code>Number</code>


* * *
<a name="new_SECRlpEncode_new"></a>

### new SECRlpEncode(config)
new SECRlpEncode(config)
Constructs a rlp encode class.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>TBD</code> | TBD, will be implemented in the future |

**Example**
```js
const RLP = require('encode.js')

const rlp = new RLP()
```


* * *
<a name="SECRlpEncode+encode"></a>
### SECRlpEncode.encode(input, buffer, offset) ⇒ <code>Buffer</code>
Returns input in RLP encoded format

| Param | Type | Description |
| --- | --- | --- |
| input | <code>{Buffer, String, Integer, Array}</code> | Input data for RLP encode |
| buffer | <code>{Buffer}</code> | Input buffer which is in RLP encoded format |
| offset | <code>{Buffer}</code> | Buffer offset position |



* * *
<a name="SECRlpEncode+decode"></a>
### SECRlpEncode.decode(input, start, end) ⇒ <code>Array</code>
RLP decode for input data

| Param | Type | Description |
| --- | --- | --- |
| input | <code>{Buffer, String, Integer, Array}</code> | Input should be in RLP encoded structure |
| start | <code>{Integer}</code> | "input" data array starting index |
| end | <code>{Integer}</code> | "input" data array ending index |



* * *
<a name="SECRlpEncode+getLength"></a>
### SECRlpEncode.getLength(input) ⇒ <code>Number</code>
Returns input's length according to the first several indication bytes

| Param | Type | Description |
| --- | --- | --- |
| input | <code>{Buffer, String, Integer, Array}</code> | Input should be in RLP encoded data, or the returned length is wrong |






* * *
# 中文简介：
本库函数用于SEC区块链的RLP编码
RLP编码用于存储和传输数据，处理数据则用.json格式文件
json文件由RLP编码过以后，由于json文件的键值被去掉了，仅保留内容，因此剩下了大量的空间

主要的函数:
1.	RLP编码: encode(input) => Buffer
	输入可以是{Buffer,String,Integer,Array}，RLP编码仅对两种数据结构进行处理：列表及字符串
	Nodejs中Array即为列表，其他类型{Buffer,String,Integer}作为字符串处理
	该函数的输出结果为RLP编码后的input，类型为Buffer

2.	RLP解码：decode(input) => Array
	输入可以是{Buffer,String,Integer,Array}，无论哪种类型，都会被先转换为Buffer类型再进行处理
	作用与encode相反，将RLP格式的数据进行解码, 输出为Array类型

3.	获取长度函数: getLength(input) => Number
	input为经过RLP编码后的数据
	函数根据前几个字节的值获取整个input数据的长度
	
RLP和JSON格式之间的转换函数：
1.	JSON转RLP：jsonToRlp(input) => Buffer
	输入为JSON格式的String, Array或Buffer，JSON格式数据首先会被去掉key值存入嵌套的Array中，然后将Array进行RLP编码
	需要注意的是，在去掉JSON键，提取值的过程中，若嵌套的下一层为Array，则下一层的第一个字符会标为0x31，若下一层为object(dictionary)，则下一层第一个字符为0x32
	例如:{"a": ["3","4"]}经过RLP编码后为 [0xc5, 0x32, 0xc3, 0x31, 0x33, 0x34]

2.	提取JSON的键数组：jsonKeyArray(input) => Array
	由于在RLP解码为JSON时，需要知晓JSON的结构(key)， 因此此方程用作提取JSON的key值，返回嵌套的数组
	同(1)中提过的，在去掉JSON值，提取key的过程中，若嵌套的下一层为Array，则下一层的第一个字符会标为0x31，若下一层为object(dictionary)，则下一层第一个字符为0x32
	例如:{"a": ["3","4"]}经过RLP编码后为 [0xc4, 0x32, 0x61, 0xc1, 0x31]

3.	RLP转JSON：rlpToJson(rlpInput, jsonKeyArray) => Array
	rlpInput为经过(1)中jsonToRlp(input)编码后输出的RLP编码结果
	jsonKeyArray为经过(2)中jsonKeyArray(input)提取出来的JSON的key所组成的Array，也可以为预先定义好固定格式的JSON结构(如我们将要用的SEC区块JSON格式)
	输出为(1)中jsonToRlp(input)的输入数据input

此外，需要注意的是：
由于在JSON和RLP互相转换的时候，number和char很难区分，因此所有的number都会被当做char处理
例如： {"a": 1} 与 {"a": "1"} 在编码解码中是相同的

因此经过解码后，JSON中是不会出现number类型的数据
即{"a": 1} 以及 {"a": "1"} 经过编码和解码后的结果都为{"a": "1"}