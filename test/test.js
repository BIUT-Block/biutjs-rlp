const test = require('tape')
const rlp = require('../encode')
const fs = require("fs")


test('SEC RLP test', t => {
  t.plan(1)
  var contents = fs.readFileSync("test_json.json")
  

  
  var a = Buffer.from([1,[2,3],[4,5,6]])
  console.log(rlp.encode(a))
  
  t.equal(1, 1)
})