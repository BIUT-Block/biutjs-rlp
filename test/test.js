const test = require('tape')
const rlp = require('../encode')
const fs = require("fs")


test('SEC RLP test', t => {
  t.plan(1)
  var contents = fs.readFileSync("test_json.json")
  console.log(rlp.encode(contents))
  console.log("------------------------")
  
  var jsonContent = JSON.parse(contents)
  console.log(typeof(jsonContent))
  
  t.equal(1, 1)
})