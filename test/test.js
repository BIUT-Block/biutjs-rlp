const test = require('tape')
const rlp = require('../encode')
const fs = require("fs")


test('SEC RLP test(unspecified JSON model)', t => {
    let config = ""
    let rlpEncode = new rlp(config, true)
    
    t.plan(2)
    var contents = fs.readFileSync("./test_json/test_json.json")
    var ebook = fs.readFileSync("./test_json/ebook_genesisBlock_origin.json")
    
    contents_rlp_encode = rlpEncode.jsonToRlp(contents)
    contents_json_format = rlpEncode.jsonKeyArray(contents)
    
    ebook_rlp_encode = rlpEncode.jsonToRlp(ebook)
    ebook_json_format = rlpEncode.jsonKeyArray(ebook)

    t.deepEqual(JSON.parse(rlpEncode.rlpToJson(contents_rlp_encode, contents_json_format)), JSON.parse(contents))
    t.deepEqual(JSON.parse(rlpEncode.rlpToJson(ebook_rlp_encode, ebook_json_format)), JSON.parse(ebook))
})

test('SEC RLP test(with SEC defined JSON model)', t => {
    t.plan(1)
    
    t.equal(1,1)
})



function display_longbuffer(buffer){
    var arr = new Array();
     
    for (var i = 0; i < buffer.length; i++) {
        arr.push(buffer[i].toString(16));
    }
     
    console.log(arr.join(' '));
}