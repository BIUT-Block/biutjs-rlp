const test = require('tape')
const rlp = require('../encode')
const fs = require("fs")


test('SEC RLP test', t => {
	t.plan(1)
	var contents = fs.readFileSync("test_json.json")
	console.log(rlp.jsonToRlp(contents))


	/*var a = [1, [2,3], [4,5,6]]
	var b = ["a"]
	console.log(rlp.encode(b))

	console.log(rlp.decode(rlp.encode(b)))*/
	t.equal(1, 1)
})