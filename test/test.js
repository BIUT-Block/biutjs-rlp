const assert = require('assert')
const RLP = require('../encode.js')


describe('RLP encoding (string):', function () {
    let rlp = new RLP()
    it('should return itself if single byte and less than 0x7f:', function () {
        var encodedSelf = rlp.encode('a')
        assert.equal(encodedSelf.toString(), 'a')
        assert.equal(rlp.getLength(encodedSelf), 1)
    })

    it('length of string 0-55 should return (0x80+len(data)) plus data', function () {
        var encodedDog = rlp.encode('dog')
        assert.equal(4, encodedDog.length)
        assert.equal(rlp.getLength(encodedDog), 4)
        assert.equal(encodedDog[0], 131)
        assert.equal(encodedDog[1], 100)
        assert.equal(encodedDog[2], 111)
        assert.equal(encodedDog[3], 103)
    })
})
