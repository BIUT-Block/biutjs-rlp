class SECRlpEncode {
    /**
     * create a SEC RLP encoding and decoding class
     * @param {*} config
     * 
     */
    constructor(config){
        this.config = config
    }

    /**
    * encode
    * @desc Returns input in RLP encoded structure
    * @param {Buffer, String, Integer, Array} input - Input data for RLP encode
    * @return {Buffer} RLP encoded input data
    */
    encode(input) {
        if (input instanceof Array) {
            let output = []
            for (let i = 0; i < input.length; i++) {
                output.push(this.encode(input[i]))
            }
            let buf = Buffer.concat(output)
            return Buffer.concat([this._encodeLength(buf.length, 192), buf])
        } else {
            input = this._toBuffer(input)
            if (input.length === 1 && input[0] < 128) {
                return input
            } else {
                return Buffer.concat([this._encodeLength(input.length, 128), input])
            }
        }
    }

    /*
    *   Encode and return the first several indication bytes
    */
    _encodeLength(len, offset) {
        if (len < 56) {
            return Buffer.from([len + offset])
        } else {
            let hexLength = this._intToHex(len)
            let lLength = hexLength.length / 2
            let firstByte = this._intToHex(offset + 55 + lLength)
            return Buffer.from(firstByte + hexLength, 'hex')
        }
    }

    /**
    * decode
    * @desc RLP decode for input data
    * @param {Buffer, String, Integer, Array} input - Input should be in RLP encoded structure
    * @return {Array}
    */
    decode(input) {
        if (!input || input.length === 0) {
            return Buffer.from([])
        }

        input = this._toBuffer(input)
        let decoded = this._decode(input)

        if (decoded.remainder.length != 0) {
            throw new Error('invalid remainder')
        }

        return decoded.data
    }

    /*
    *   RLP first-indication bytes parser
    */
    _decode(input) {
        
        let length, llength, data, innerRemainder, d
        let decoded = []
        let firstByte = input[0]

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
            length = this._safeParseInt(input.slice(1, llength).toString('hex'), 16)
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
                d = this._decode(innerRemainder)    
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
            length = this._safeParseInt(input.slice(1, llength).toString('hex'), 16)
            let totalLength = llength + length
            if (totalLength > input.length) {
                throw new Error('invalid rlp: total length is larger than the data')
            }

            innerRemainder = input.slice(llength, totalLength)
            if (innerRemainder.length === 0) {
                throw new Error('invalid rlp, List has a invalid length')
            }

            while (innerRemainder.length) {
                d = this._decode(innerRemainder)
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
    getLength(input) {
        if (!input || input.length === 0) {
            return Buffer.from([])
        }

        input = this._toBuffer(input)
        let firstByte = input[0]
        if (firstByte <= 0x7f) {
            //a character has a value smaller than 128
            return input.length
        } else if (firstByte <= 0xb7) {
            //a string between 0-55 bytes long
            return firstByte - 0x7f
        } else if (firstByte <= 0xbf) {
            //a string over 55 bytes long
            let llength = firstByte - 0xb6
            let length = this._safeParseInt(input.slice(1, llength).toString('hex'), 16)
            return llength + length
        } else if (firstByte <= 0xf7) {
            // a list between  0-55 bytes long
            return firstByte - 0xbf
        } else {
            // a list over 55 bytes long
            let llength = firstByte - 0xf6
            let length = this._safeParseInt(input.slice(1, llength).toString('hex'), 16)
            return llength + length
        }
    }

    /*
    *   Convert data from other data types to Buffer type
    */
    _toBuffer(v) {
        if (!Buffer.isBuffer(v)) {
            if (typeof v === 'string') {
                if (this._isHexPrefixed(v)) {
                    v = Buffer.from(this._padToEven(this._stripHexPrefix(v)), 'hex')
                } else {
                    v = Buffer.from(v)
                }
            } else if (typeof v === 'number') {
            if (!v) {
                v = Buffer.from([])
            } else {
                v = this._intToBuffer(v)
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
    *   Convert number to hex format string buffer
    */
    _intToBuffer(i) {
        let hex = this._intToHex(i)
        return Buffer.from(hex, 'hex')
    }

    /*
    *   If the input length is not even, and a "0" in front
    */
    _padToEven (a){
        if (a.length % 2) a = '0' + a
        return a
    }

    /*
    *   Removes 0x from a given String
    */
    _stripHexPrefix(str) {
        if (typeof str !== 'string') {
            return str
        }
        return this._isHexPrefixed(str) ? str.slice(2) : str
    }

    /*
    *   Check whether the string has perfix "0x"
    */
    _isHexPrefixed (str) {
        return str.slice(0, 2) === '0x'
    }

    /*
    *   Convert number to hex format string and compensate the length even (e.g. 10 => "0A") 
    */
    _intToHex(i) {
        let hex = i.toString(16)
        if (hex.length % 2) {
            hex = '0' + hex
        }

        return hex
    }

    /*
    *   Convert string to number (e.g. "0400" => 1024)
    */
    _safeParseInt(v, base) {
        if (v.slice(0, 2) === '00') {
            throw (new Error('invalid RLP: extra zeros'))
        }

        return parseInt(v, base)
    }
}

module.exports = SECRlpEncode;