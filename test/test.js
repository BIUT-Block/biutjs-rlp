const assert = require('assert')
const RLP = require('../encode.js')
const fs = require('fs')

const rlp = new RLP()

describe('RLP encoding (string):', function () {
  it('should return itself if single byte and less than 0x7f:', function () {
    let encodedSelf = rlp.encode('a')
    assert.equal(encodedSelf.toString(), 'a')
    assert.equal(rlp.getLength(encodedSelf), 1)
  })

  it('length of string 0-55 should return (0x80+len(data)) plus data', function () {
    let encodedDog = rlp.encode('dog')
    assert.equal(4, encodedDog.length)
    assert.equal(rlp.getLength(encodedDog), 4)
    assert.equal(encodedDog[0], 131)
    assert.equal(encodedDog[1], 100)
    assert.equal(encodedDog[2], 111)
    assert.equal(encodedDog[3], 103)
  })
})

describe('SEC RLP test(unspecified JSON model)', function () {
  let contents = fs.readFileSync('./test_json/test_json.json')
  // let ebook = fs.readFileSync('./test_json/ebook_genesisBlock_origin.json')

  let contentsRlpEncode = rlp.jsonToRlp(contents)
  let contentsJsonFormat = rlp.jsonKeyArray(contents)

  // let ebook_rlp_encode = rlp.jsonToRlp(ebook)
  // let ebook_json_format = rlp.jsonKeyArray(ebook)

  assert.deepEqual(JSON.parse(rlp.rlpToJson(contentsRlpEncode, contentsJsonFormat)), JSON.parse(contents))
  // assert.deepEqual(JSON.parse(rlp.rlpToJson(ebook_rlp_encode, ebook_json_format)), JSON.parse(ebook))
})
