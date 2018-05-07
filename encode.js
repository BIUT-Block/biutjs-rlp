const Buffer = require('safe-buffer').Buffer

/**
* jsonToRlp
* @desc RLP encoding for json file
* @param {Buffer, String, Integer, Array} input - Input is json file raw data (not parsed)
* @return {Buffer} RLP encoded json data
*/
exports.jsonToRlp = function (input) {
	if (isJsonString(input) == false) {
		throw new Error('invalid JSON input')
	}

	input = JSON.parse(input);
	
	var json_array = jsonToArray(input)

	return exports.encode(json_array)
}

/*
*	Remove keys in json file and return a nested array
*/
jsonToArray = function (input) {
	var json_array = new Array()
	
	if (hasNestedList(input) == false) {
		return input
	}
	if (input instanceof Array) {
		input.forEach(function(element) {
		  json_array.push(jsonToArray(element))
		})
		return json_array
	}
	
	Object.keys(input).forEach(function(key, keyIndex) {
		if (typeof input[key] == 'number') {
			input[key] = input[key].toString()
		}
		json_array.push(jsonToArray(input[key]))
	})
	
	return json_array
}

/*
*	Verify whether "input" is in json format
*/
function isJsonString(input) {
    try {
        JSON.parse(input);
    } catch (e) {
        return false;
    }
    return true;
}

/*
*	Verify whether input has a nested list
*/
function hasNestedList(v) {
	if (JSON.stringify(v).indexOf("{") > -1){
		return true
	}
	
	return false
}

/**
* jsonRlpInit
* @desc Create an array with json keys only (for decoding)
* @param {Buffer, String, Integer, Array} input - Input is json file raw data (not parsed)
* @return {Array} Nested array comsists of json keys
*/
exports.jsonRlpInit = function (input) {
	if (isJsonString(input) == false) {
		throw new Error('invalid JSON file')
	}

	input = JSON.parse(input);

	return jsonKeyRegister(input)
}

/*
*	Return an array with json keys only
*/
jsonKeyRegister = function (input) {
	var json_array = new Array()
	
	/**********此处应该改?或者不需要，因为内容中肯定不会出现冒号？暂时先用着**************/
	if (hasNestedKey(input) == false) {
		return null
	}
	
	if (input instanceof Array) {
		input.forEach(function(element) {
		  json_array.push(jsonKeyRegister(element))
		})
		return json_array
	}
	
	Object.keys(input).forEach(function(key, keyIndex) {
		if (key != '0') {
			json_array.push(key)
		}
		if (hasNestedKey(input[key]) == true) {
			json_array.push(jsonKeyRegister(input[key]))
		}
	})
	
	return json_array
}

/*
*	Verify whether input is dictionary structure
*/
function hasNestedKey(v) {
	if (JSON.stringify(v).indexOf(":") > -1){
		return true
	}
	
	return false
}

/**
* rlpToJson
* @desc rlp data structure revert to JSON file
* @param {Buffer, String, Integer, Array} rlp_input - Input is rlp format data
* @param {Array} json_key_array - Json format, if this argument is empty, then uses the default format
* @return {Array} rlp decoded JSON array
*/
exports.rlpToJson = function (rlp_input, json_key_array) {
	decode_result = exports.decode(rlp_input)

	if (json_key_array == null) {
		json_key_array = [ 'rlpTesttest', [ 'intest', 'outtest' ] ]
	}
	
	if (!(json_key_array instanceof Array)) {
		throw new Error("invalid input type")
	}
	
	return "".concat("{", combineKeyValue(decode_result, json_key_array), "}")
}

/*
*	Combine json key array and value array and return a complete json file
*/
function combineKeyValue(decode_result, json_key_array) {
	var json_array = []
	//json_key_array length is longer than decode_result, this variable is the index difference between the two arrays
	index_diff = 0
	
	for (var i = 0; i < json_key_array.length; i++) {
		
		if (Buffer.isBuffer(decode_result[i - index_diff])) {
			decode_result[i - index_diff] = decode_result[i - index_diff].toString('utf8')
		}
		
		if ((typeof decode_result[i - index_diff] === 'string') && (typeof json_key_array[i] === 'string')) {
			json_array.push("\"", json_key_array[i], "\": \"", decode_result[i], "\",")
		}
		else if ((decode_result[i - index_diff] instanceof Array) && (typeof json_key_array[i] === 'string')) {
			json_array.push("\"", json_key_array[i], "\": ")
			index_diff++
		}
		else if ((decode_result[i - index_diff] instanceof Array) && (json_key_array[i] instanceof Array)) {
			if (json_key_array[i][0] instanceof Array) {
				json_array.push("[")
				var return_result = combineKeyValue(decode_result[i - index_diff], json_key_array[i])
				json_array.push(return_result.slice(0, return_result.length - 1))	//remove the last comma
				json_array.push("]")
			} else {
				json_array.push("{")
				var return_result = combineKeyValue(decode_result[i - index_diff], json_key_array[i])
				json_array.push(return_result.slice(0, return_result.length - 1))	//remove the last comma
				json_array.push("},")
			}
			
		}
		else {
			console.log(decode_result[i - index_diff])
			console.log(json_key_array[i])
			throw new Error("Unknown error, debug for more information")
		}
	}
	
	return json_array.join("")
}

/**
* encode
* @desc Returns input in RLP encoded structure
* @param {Buffer, String, Integer, Array} input - Input data for RLP encode
* @return {Buffer} RLP encoded input data
*/
exports.encode = function (input) {
	if (input instanceof Array) {
		var output = []
		for (var i = 0; i < input.length; i++) {
			output.push(exports.encode(input[i]))
		}
		var buf = Buffer.concat(output)
		return Buffer.concat([encodeLength(buf.length, 192), buf])
	} else {
		input = toBuffer(input)
		if (input.length === 1 && input[0] < 128) {
			return input
		} else {
			return Buffer.concat([encodeLength(input.length, 128), input])
		}
	}
}

/*
*	Encode and return the first several indication bytes
*/
function encodeLength (len, offset) {
	if (len < 56) {
		return Buffer.from([len + offset])
	} else {
		var hexLength = intToHex(len)
		var lLength = hexLength.length / 2
		var firstByte = intToHex(offset + 55 + lLength)
		return Buffer.from(firstByte + hexLength, 'hex')
	}
}

/**
* decode
* @desc RLP decode for input data
* @param {Buffer, String, Integer, Array} input - Input should be in RLP encoded structure
* @return {Array}
*/
exports.decode = function (input) {
	if (!input || input.length === 0) {
		return Buffer.from([])
	}

	input = toBuffer(input)
	var decoded = _decode(input)

	if (decoded.remainder.length != 0) {
		throw new Error('invalid remainder')
	}

	return decoded.data
}

/*
*	RLP first-indication bytes parser
*/
function _decode (input) {
	var length, llength, data, innerRemainder, d
	var decoded = []
	var firstByte = input[0]

	if (firstByte <= 0x7f) {
		// a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
		return {
			data: input.slice(0, 1),
			remainder: input.slice(1)
		}
	} else if (firstByte <= 0xb7) {
		// string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string
		// The range of the first byte is [0x80, 0xb7]
		length = firstByte - 0x7f

		// set 0x80 null to 0
		if (firstByte === 0x80) {
			data = Buffer.from([])
		} else {
			data = input.slice(1, length)
		}

		if (length === 2 && data[0] < 0x80) {
			throw new Error('invalid rlp encoding: byte must be less 0x80')
		}

		return {
			data: data,
			remainder: input.slice(length)
		}
	} else if (firstByte <= 0xbf) {
		llength = firstByte - 0xb6
		length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
		data = input.slice(llength, length + llength)
		if (data.length < length) {
			throw (new Error('invalid RLP'))
		}

		return {
			data: data,
			remainder: input.slice(length + llength)
		}
	} else if (firstByte <= 0xf7) {
		// a list between  0-55 bytes long
		length = firstByte - 0xbf
		innerRemainder = input.slice(1, length)
		while (innerRemainder.length) {
			d = _decode(innerRemainder)
			decoded.push(d.data)
			innerRemainder = d.remainder
		}

		return {
			data: decoded,
			remainder: input.slice(length)
		}
	} else {
		// a list  over 55 bytes long
		llength = firstByte - 0xf6
		length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
		var totalLength = llength + length
		if (totalLength > input.length) {
			throw new Error('invalid rlp: total length is larger than the data')
		}

		innerRemainder = input.slice(llength, totalLength)
		if (innerRemainder.length === 0) {
			throw new Error('invalid rlp, List has a invalid length')
		}

		while (innerRemainder.length) {
			d = _decode(innerRemainder)
			decoded.push(d.data)
			innerRemainder = d.remainder
		}
		return {
			data: decoded,
			remainder: input.slice(totalLength)
		}
	}
}

/**
* getLength
* @desc Returns input's length according to the first several indication bytes
* @param {Buffer, String, Integer, Array} input - Input should be in RLP encoded data, or the returned length is wrong
* @return {Number}
*/
exports.getLength = function (input) {
	if (!input || input.length === 0) {
		return Buffer.from([])
	}

	input = toBuffer(input)
	var firstByte = input[0]
	if (firstByte <= 0x7f) {
		//a character has a value smaller than 128
		return input.length
	} else if (firstByte <= 0xb7) {
		//a string between 0-55 bytes long
		return firstByte - 0x7f
	} else if (firstByte <= 0xbf) {
		//a string over 55 bytes long
		var llength = firstByte - 0xb6
		var length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
		return llength + length
	} else if (firstByte <= 0xf7) {
		// a list between  0-55 bytes long
		return firstByte - 0xbf
	} else {
		// a list over 55 bytes long
		var llength = firstByte - 0xf6
		var length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
		return llength + length
	}
}

/*
*	Convert data from other data types to Buffer type
*/
function toBuffer (v) {
	if (!Buffer.isBuffer(v)) {
		if (typeof v === 'string') {
			if (isHexPrefixed(v)) {
				v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
			} else {
				v = Buffer.from(v)
			}
		} else if (typeof v === 'number') {
		if (!v) {
			v = Buffer.from([])
		} else {
			v = intToBuffer(v)
		}
		} else if (v === null || v === undefined) {
			v = Buffer.from([])
		} else if (v.toArray) {
			// converts a BN to a Buffer
			v = Buffer.from(v.toArray())
		} else {
			throw new Error('invalid type')
		}
	}
	return v
}

/*
*	Convert number to hex format string buffer
*/
function intToBuffer (i) {
	var hex = intToHex(i)
	return Buffer.from(hex, 'hex')
}

/*
*	If the input length is not even, and a "0" in front
*/
function padToEven (a) {
	if (a.length % 2) a = '0' + a
	return a
}

/*
*	Removes 0x from a given String
*/
function stripHexPrefix (str) {
	if (typeof str !== 'string') {
		return str
	}
	return isHexPrefixed(str) ? str.slice(2) : str
}

/*
*	Check whether the string has perfix "0x"
*/
function isHexPrefixed (str) {
	return str.slice(0, 2) === '0x'
}

/*
*	Convert number to hex format string and compensate the length even (e.g. 10 => "0A") 
*/
function intToHex (i) {
	var hex = i.toString(16)
	if (hex.length % 2) {
		hex = '0' + hex
	}

	return hex
}

/*
*	Convert string to number (e.g. "0400" => 1024)
*/
function safeParseInt (v, base) {
	if (v.slice(0, 2) === '00') {
		throw (new Error('invalid RLP: extra zeros'))
	}

	return parseInt(v, base)
}
