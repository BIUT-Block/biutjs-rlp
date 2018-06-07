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

describe('SEC RLP test(unspecified JSON model)', function () {
  let contents = fs.readFileSync('./test-json.json')

  let contentsRlpEncode = rlp.jsonToRlp(contents)
  let contentsJsonFormat = rlp.jsonKeyArray(contents)

  assert.deepEqual(JSON.parse(rlp.rlpToJson(contentsRlpEncode, contentsJsonFormat)), JSON.parse(contents))
})
