中文简介：
本库函数用于SEC区块链的RLP编码
RLP编码用于存储和传输数据，处理数据则用.json格式文件
json文件由RLP编码过以后，由于json文件的键值被去掉了，仅保留内容，因此剩下了大量的空间

主要的函数:
1.	ELP编码: encode(input) => Buffer
	输入可以是{Buffer,String,Integer,Array}，RLP编码仅对两种数据结构进行处理：列表及字符串
	Nodejs中Array即为列表，其他类型{Buffer,String,Integer}作为字符串处理
	该函数的输出结果为RLP编码后的input，类型为Buffer

2.	RLP解码：decode(input) => Array
	输入可以是{Buffer,String,Integer,Array}，无论哪种类型，都会被先转换为Buffer类型再进行处理
	作用与encode相反，将RLP格式的数据进行解码, 输出为Array类型

3.	获取长度函数: getLength(input) => number
	input为经过RLP编码后的数据结构
	函数根据前几个字节的值获取整个input数据的长度（长度不包括前几个字节）