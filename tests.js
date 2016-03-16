var Bert = require('./bert.js');
var chai = require('chai');

var should = chai.should();
var expect = chai.expect;

describe('Bert', function() {

    it ('should encode atom', function() {
        Bert.binary_to_list(Bert.encode(Bert.atom('hello'))).should.deep.equal([
            131,100,0,5,104,101,108,108,111
        ]);
    });

    it ('should encode binary', function() {
        Bert.binary_to_list(Bert.encode(Bert.binary("hello"))).should.deep.equal([
            131,109,0,0,0,5,104,101,108,108,111
        ]);
    });

    it ('should encode boolean', function() {
        Bert.binary_to_list(Bert.encode(true)).should.deep.equal([
            131,104,2,100,0,4,98,101,114,116,100,0,4,116,114,117,101
        ]);

        Bert.binary_to_list(Bert.encode(false)).should.deep.equal([
            131,104,2,100,0,4,98,101,114,116,100,0,5,102,97,108,115,101
        ]);
    });

    it ('should encode ints', function() {
        expect(Bert.binary_to_list(Bert.encode(0))).to.deep.equal([
            131,97,0
        ]);

        expect(Bert.binary_to_list(Bert.encode(-1))).to.deep.equal([
            131,98,255,255,255,255
        ]);

        expect(Bert.binary_to_list(Bert.encode(42))).to.deep.equal([
            131,97,42
        ]);

        expect(Bert.binary_to_list(Bert.encode(5000))).to.deep.equal([
            131,98,0,0,19,136
        ]);

        expect(Bert.binary_to_list(Bert.encode(-5000))).to.deep.equal([
            131,98,255,255,236,120
        ]);

        expect(Bert.binary_to_list(Bert.encode(987654321))).to.deep.equal([
            131,110,4,0,177,104,222,58
        ]);

        expect(Bert.binary_to_list(Bert.encode(-987654321))).to.deep.equal([
            131,110,4,1,177,104,222,58
        ]);
    });

    it ('should encode null', function() {
        expect(Bert.binary_to_list(Bert.encode(null))).to.deep.equal([
            131,100,0,4,110,117,108,108
        ]);
    });

    it ('should not encode undefined', function() {
        expect(function(){
            Bert.binary_to_list(Bert.encode(undefined))
        }).to.throw("Cannot encode undefined values.")
    });

    it ('should encode floats', function() {
        expect(Bert.binary_to_list(Bert.encode(2.5))).to.deep.equal([
            131,99,50,46,53,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,101,
            43,48,48,0,0,0,0,0
        ], 'failed 2.5');

        expect(Bert.binary_to_list(Bert.encode(3.14159))).to.deep.equal([
            131,99,51,46,49,52,49,53,56,57,57,57,57,57,57,57,57,57,57,56,56,50,54,50,101,
            43,48,48,0,0,0,0,0
        ], 'failed 3.14158');

        expect(Bert.binary_to_list(Bert.encode(-3.14159))).to.deep.equal([
            131,99,45,51,46,49,52,49,53,56,57,57,57,57,57,57,57,57,57,57,56,56,50,54,50,
            101,43,48,48,0,0,0,0
        ], 'failed -3.14159');

        expect(Bert.binary_to_list(Bert.encode(0.0012))).to.deep.equal([
            131,99,49,46,49,57,57,57,57,57,57,57,57,57,57,57,57,57,57,56,57,52,56,56,101,
            45,48,51,0,0,0,0,0
        ]);

        expect(Bert.binary_to_list(Bert.encode(-0.0012))).to.deep.equal([
            131,99,45,49,46,49,57,57,57,57,57,57,57,57,57,57,57,57,57,57,56,57,52,56,56,
            101,45,48,51,0,0,0,0
        ]);
    });

    it ('should encode arrays', function() {
        expect(Bert.binary_to_list(Bert.encode(["1","2","3"]))).to.deep.equal([
            131,108,0,0,0,3,107,0,1,49,107,0,1,50,107,0,1,51,106
        ]);
    });

    it ('should encode assoc arrays', function(){
        expect(Bert.binary_to_list(Bert.encode({a : 1, b : 2, c : 3}))).to.deep.equal([
            131,108,0,0,0,3,104,2,100,0,1,97,97,1,104,2,100,0,1,98,97,2,104,2,100,0,1,99,97,3,106
        ])
    });
    it ('should encode tuple', function(){
        expect(Bert.binary_to_list(Bert.encode(Bert.tuple("Hello", 1)))).to.deep.equal([
            131,104,2,107,0,5,72,101,108,108,111,97,1
        ])
    });
    it ('should encode empty list', function(){
        expect(Bert.binary_to_list(Bert.encode([]))).to.deep.equal([
            131,104,2,100,0,4,98,101,114,116,100,0,3,110,105,108
        ])
    });
    it ('should encode complex', function(){
        expect(Bert.binary_to_list(Bert.encode({
            a : Bert.tuple(1, 2, 3),
            b : [400, 5, 6]
        }))).to.deep.equal([
            131,108,0,0,0,2,104,2,100,0,1,97,104,3,97,1,97,2,97,3,104,2,100,0,1,98,108,0,0,0,3,98,0,0,1,144,97,5,97,6,106,106
        ])
    });
    it ('should decode complex', function(){

        var term = Bert.decode(Bert.bytes_to_string([131, 108, 0, 0, 0, 4, 104, 2, 100, 0, 4, 97, 116, 111, 109, 100, 0, 6, 109, 121, 65, 116, 111, 109, 104, 2, 100, 0, 6, 98, 105, 110, 97, 114, 121, 109, 0, 0, 0, 9, 77, 121, 32, 66, 105, 110, 97, 114, 121, 104, 2, 100, 0, 4, 98, 111, 111, 108, 100, 0, 4, 116, 114, 117, 101, 104, 2, 100, 0, 6, 115, 116, 114, 105, 110, 103, 107, 0, 11, 72, 101, 108, 108, 111, 32, 116, 104, 101, 114, 101, 106]))
        expect(Bert.pp_term(term)).to.equal('{atom, myAtom},{binary, <<"My Binary">>},{bool, true},{string, Hello there}')

    });
    it ('should decode small ints', function(){
        expect(Bert.decode(Bert.bytes_to_string([131,97,130]))).to.equal(130)
    })
    it ('should decode negative ints', function(){
        expect(Bert.decode(Bert.bytes_to_string([131,98,255,255,255,255]))).to.equal(-1)
    });
    it ('should decode ints', function(){
        var term = Bert.decode(Bert.bytes_to_string([131, 108, 0, 0, 0, 5, 104, 2, 100, 0, 13, 115, 109, 97, 108, 108, 95, 105, 110, 116, 101, 103, 101, 114, 97, 42, 104, 2, 100, 0, 8, 105, 110, 116, 101, 103, 101, 114, 49, 98, 0, 0, 19, 136, 104, 2, 100, 0, 8, 105, 110, 116, 101, 103, 101, 114, 50, 98, 255, 255, 236, 120, 104, 2, 100, 0, 8, 98, 105, 103, 95, 105, 110, 116, 49, 110, 4, 0, 177, 104, 222, 58, 104, 2, 100, 0, 8, 98, 105, 103, 95, 105, 110, 116, 50, 110, 4, 1, 177, 104, 222, 58, 106]));
        expect(Bert.pp_term(term)).to.equal('{small_integer, 42},{integer1, 5000},{integer2, -5000},{big_int1, 987654321},{big_int2, -987654321}')
    });
    it ('should decode floats', function(){
        // Try decoding this: -3.14159
        var term = Bert.decode(Bert.bytes_to_string([131,99,45,51,46,49,52,49,53,56,57,57,57,57,57,57,57,57,57,57,56,56,50,54,50,101,43,48,48,0,0,0,0]));
        expect(term).to.equal(-3.14159);
    });
    it ('should decode empty list', function(){
        var term = Bert.decode(Bert.bytes_to_string([131, 106]));
        expect(term).to.deep.equal([]);
    });
    it ('should decode true', function(){
        var term = Bert.decode(Bert.bytes_to_string([131,104,2,100,0,4,98,101,114,116,100,0,4,116,114,117,101]));
        expect(term).to.equal(true);
    })
    it ('should decode false', function(){
        var term = Bert.decode(Bert.bytes_to_string([131,104,2,100,0,4,98,101,114,116,100,0,5,102,97,108,115,101]));
        expect(term).to.equal(false);
    })

});
