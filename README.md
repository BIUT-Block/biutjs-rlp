<a name="SECJS-RLP"></a>

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard) 

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)]

* * *
## SECRlpEncode

This package is used for SEC blockchain rlp encoding.

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
1.	RLP编码: encode(input, buffer, offset) => Buffer
	输入"input"可以是{Buffer,String,Integer,Array}，RLP编码仅对两种数据结构进行处理：列表及字符串
	Nodejs中Array即为列表，其他类型{Buffer,String,Integer}作为字符串处理
	该函数的输出结果为RLP编码后的input，类型为Buffer

2.	RLP解码：decode(input, start, end) => Array
	输入"input"可以是{Buffer,String,Integer,Array}，无论哪种类型，都会被先转换为Buffer类型再进行处理
	作用与encode相反，将RLP格式的数据进行解码, 输出为Array类型

3.	获取长度函数: getLength(input) => Number
	input为经过RLP编码后的数据
	函数根据前几个字节的值获取整个input数据的长度