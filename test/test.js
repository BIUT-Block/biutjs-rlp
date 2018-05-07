const test = require('tape')
const rlp = require('../encode')
const fs = require("fs")


test('SEC RLP test', t => {
	t.plan(1)
	var contents = fs.readFileSync("test_json.json")
	var ebook = fs.readFileSync("genesisBlock.json")
	
	contents_rlp_encode = rlp.jsonToRlp(contents)
	contents_json_format = rlp.jsonRlpInit(contents)
	
	
	ebook_rlp_encode = rlp.jsonToRlp(ebook)
	ebook_json_format = rlp.jsonRlpInit(ebook)
	if(1){
		console.log("--------------------------")
		console.log(rlp.decode(ebook_rlp_encode))
		console.log("--------------------------")
		console.log(ebook_json_format)
		console.log("--------------------------")
		console.log(JSON.parse(rlp.rlpToJson(ebook_rlp_encode, ebook_json_format)))
		console.log("--------------------------")
		console.log(JSON.parse(ebook))
		console.log("--------------------------")
	}
	
	if(0){
		console.log("--------------------------")
		console.log(rlp.decode(contents_rlp_encode))
		console.log("--------------------------")
		console.log(contents_json_format)
		console.log("--------------------------")
	}
	
	//t.deepEqual(JSON.parse(contents), JSON.parse(rlp.rlpToJson(contents_rlp_encode, contents_json_format)))
	t.deepEqual(JSON.parse(ebook), JSON.parse(rlp.rlpToJson(ebook_rlp_encode, ebook_json_format)))
})


function display_longbuffer(buffer){
	var arr = new Array();
	 
	for (var i = 0; i < buffer.length; i++) {
		arr.push(buffer[i].toString(16));
	}
	 
	console.log(arr.join(' '));
}