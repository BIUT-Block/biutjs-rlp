const assert = require('assert')
const fs = require('fs')
const RLP = require('../src/index')

const rlp = new RLP()

describe('RLP encoding (string):', function () {
  it('should return itself if single byte and less than 0x7f:', function () {
    let encodedSelf = rlp.encode('a')
    assert.equal(encodedSelf.toString(), 'a')
    assert.equal(rlp.getLength(encodedSelf), 1)
  })
})