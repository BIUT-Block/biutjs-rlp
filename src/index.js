class SECRlpEncode {
  /**
     * create a SEC RLP encoding and decoding class
     * @param {*} config
     *
     */
  constructor (config) {
    this.config = config
  }

  /**
    * encode
    * @desc Returns input in RLP encoded format
    * @param {Buffer, String, Integer, Array} input - Input data for RLP encode
    * @param {Buffer} buffer - Input buffer which is in RLP encoded format
    * @param {Buffer} offset - Buffer offset position
    * @return {Buffer} RLP encoded input data
    */
  encode (input, buffer, offset = 0) {
    let buf
    if (Array.isArray(input)) {
      buf = Buffer.concat(input.map((item) => this.encode(item)))
      buf = Buffer.concat([ this._encodeLength(buf.length, 0xc0), buf ])
    } else {
      buf = this._toBuffer(input)
      if (!(buf.length === 1 && buf[0] < 0x80)) {
        buf = Buffer.concat([ this._encodeLength(buf.length, 0x80), buf ])
      }
    }

    if (buffer !== undefined) {
      if (offset + buf.length > buffer.length) throw new Error('Not enough buffer size')
      buf.copy(buffer, offset)
      buf = buffer
    }

    this.encode.bytes = buf.length
    return buf
  }

  /*
    *   Return the length indication prefix
    */
  _encodeLength (len, offset) {
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
    * @param {Integer} start - "input" data array starting index
    * @param {Integer} end - "input" data array ending index
    * @return {Array}
    */
  decode (input, start = 0, end = input.length) {
    if (start >= end) throw new Error('Not enough data for decode')

    const firstByte = input[start]

    // A single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
    if (firstByte <= 0x7f) {
      this.decode.bytes = 1
      return Buffer.from([ firstByte ])
    }

    // String is 0-55 bytes long.
    // A single byte with value 0x80 plus the length of the string followed by the string.
    // The range of the first byte is [0x80, 0xb7]
    if (firstByte <= 0xb7) {
      const length = firstByte - 0x80
      if (length === 1 && input[start + 1] < 0x80) {
        throw new Error('First byte must be less than 0x80')
      }

      const value = this._bufferCopy(input, start + 1, length)
      if (value.length !== length) {
        throw new Error('Not enough data for decode')
      }

      this.decode.bytes = 1 + length
      return value
    }

    // String with length more than 55 bytes long.
    // A single byte with value 0xb7 plus the length in bytes of the length of the string in binary form,
    // followed by the length of the string, followed by the string.
    // The range of the first byte is thus [0xb8, 0xbf]
    if (firstByte <= 0xbf) {
      const lengthLength = firstByte - 0xb7
      const length = this._decodeLength(input, start + 1, lengthLength)
      if (length <= 55) {
        throw new Error('Invalid length')
      }

      const value = this._bufferCopy(input, start + 1 + lengthLength, length)
      if (value.length !== length) {
        throw new Error('Not enough data for decode')
      }

      this.decode.bytes = 1 + lengthLength + length
      return value
    }

    // If the total payload of a list is 0-55 bytes long,
    // the RLP encoding consists of a single byte with value 0xc0 plus the length of the list
    // followed by the concatenation of the RLP encodings of the items.
    // The range of the first byte is thus [0xc0, 0xf7]
    if (firstByte <= 0xf7) {
      const length = firstByte - 0xc0
      const value = this._decodeList(input, start + 1, length)
      this.decode.bytes = 1 + length
      return value
    }

    // If the total payload of a list is more than 55 bytes long,
    // the RLP encoding consists of a single byte with value 0xf7 plus the length in bytes of the length
    // of the payload in binary form, followed by the length of the payload,
    // followed by the concatenation of the RLP encodings of the items.
    // The range of the first byte is thus [0xf8, 0xff]
    const lengthLength = firstByte - 0xf7
    const length = this._decodeLength(input, start + 1, lengthLength)
    if (length < 55) {
      throw new Error('Invalid length')
    }

    const value = this._decodeList(input, start + 1 + lengthLength, length)
    this.decode.bytes = 1 + lengthLength + length
    return value
  }

  /*
    *   Return the length of the following string or list
    */
  _decodeLength (input, offset, length) {
    if (input[offset] === 0) {
      throw new Error('Extra zeros')
    }

    const value = parseInt(input.slice(offset, offset + length).toString('hex'), 16)
    if (isNaN(value) || !isFinite(value)) {
      throw new Error('Invalid length')
    }

    return value
  }

  /*
    *   RLP decode for nested list or string
    */
  _decodeList (input, start, length) {
    const lst = []

    for (const end = start + length; start !== end; start += this.decode.bytes) {
      lst.push(this.decode(input, start, end))
    }

    return lst
  }

  /**
    * getLength
    * @desc Returns input's length according to the length prefix
    * @param {Buffer, String, Integer, Array} input - Input should be in RLP encoded data, or the returned length is wrong
    * @return {Number}
    */
  getLength (input) {
    if (Array.isArray(input)) {
      const length = input.reduce((total, item) => total + this.getLength(item), 0)
      return this._encodingLength(length) + length
    }

    const buffer = this._toBuffer(input)
    let length = buffer.length
    if (!(buffer.length === 1 && buffer[0] < 0x80)) {
      length += this._encodingLength(length)
    }

    return length
  }

  _encodingLength (value) {
    let length = 1
    if (value > 55) {
      length += this._intToHex(value).length / 2
    }

    return length
  }

  /*
    *   Convert data from other data types to Buffer type
    */
  _toBuffer (v) {
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
  _intToBuffer (i) {
    let hex = this._intToHex(i)
    return Buffer.from(hex, 'hex')
  }

  /*
    *   If the input length is not even, and a '0' in front
    */
  _padToEven (a) {
    if (a.length % 2) a = '0' + a
    return a
  }

  /*
    *   Removes 0x from a given String
    */
  _stripHexPrefix (str) {
    if (typeof str !== 'string') {
      return str
    }
    return this._isHexPrefixed(str) ? str.slice(2) : str
  }

  /*
    *   Check whether the string has perfix '0x'
    */
  _isHexPrefixed (str) {
    return str.slice(0, 2) === '0x'
  }

  /*
    *   Convert number to hex format string and compensate the length even (e.g. 10 => '0A')
    */
  _intToHex (i) {
    let hex = i.toString(16)
    if (hex.length % 2) {
      hex = '0' + hex
    }

    return hex
  }

  /*
    *   Convert string to number (e.g. '0400' => 1024)
    */
  _safeParseInt (v, base) {
    if (v.slice(0, 2) === '00') {
      throw (new Error('invalid RLP: extra zeros'))
    }

    return parseInt(v, base)
  }

  /*
  *   Copy a buffer
  */
  _bufferCopy (buffer, start, length) {
    return Buffer.from(buffer.slice(start, start + length))
  }
}

module.exports = SECRlpEncode
