describe('Bert')
    .should('encode atom', function(){
    	expect(Bert.binary_to_list(Bert.encode(Bert.atom("hello")))).toEqual([
    	    131,100,0,5,104,101,108,108,111
    	    ]);
    })
    .should('encode binary', function(){
    	expect(Bert.binary_to_list(Bert.encode(Bert.binary("hello")))).toEqual([
    	    131,109,0,0,0,5,104,101,108,108,111
    	]);
    })
    .should('encode boolean', function(){
    	expect(Bert.binary_to_list(Bert.encode(true))).toEqual([
    	    131,100,0,4,116,114,117,101
    	]);
    	expect(Bert.binary_to_list(Bert.encode(false))).toEqual([
    	    131,100,0,5,102,97,108,115,101
    	]);
    })
    .should('encode ints', function(){
        expect(Bert.binary_to_list(Bert.encode(0))).toEqual([
    	    131,97,0
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(-1))).toEqual([
    	    131,98,255,255,255,255
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(42))).toEqual([
    	    131,97,42
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(5000))).toEqual([
    	    131,98,0,0,19,136
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(-5000))).toEqual([
    	    131,98,255,255,236,120
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(987654321))).toEqual([
    	    131,110,4,0,177,104,222,58
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(-987654321))).toEqual([
    	    131,110,4,1,177,104,222,58
    	]);
    })
    
    .should('encode null', function(){
        expect(Bert.binary_to_list(Bert.encode(null))).toEqual([
            131,100,0,4,110,117,108,108
            ])
    })
    
    .should('not encode undefined', function(){
        expect(function(){
            Bert.binary_to_list(Bert.encode(undefined))
        }).toRaise("Cannot encode undefined values.")
    })
    
    .should('encode floats', function(){
        expect(Bert.binary_to_list(Bert.encode(2.5))).toEqual([
            131,99,50,46,53,48,48,48,48,48,48,48,48,48,48,48,48,48,48,
            48,48,48,48,48,101,43,48,48,0,0,0,0,0
            ])
        
    	expect(Bert.binary_to_list(Bert.encode(3.14159))).toEqual([
    	    131,99,51,46,49,52,49,53,56,57,57,57,57,57,57,57,57,57,57,
             56,56,50,54,50,101,43,48,48,0
    	]);
    	
    	expect(Bert.binary_to_list(Bert.encode(-3.14159))).toEqual([
    	    131,99,45,51,46,49,52,49,53,56,57,57,57,57,57,57,57,57,
              57,57,56,56,50,54,50,101,43,48,48
    	]);
    })
    
    .should('encode arrays', function(){
        expect(Bert.binary_to_list(Bert.encode(["1","2","3"]))).toEqual([
    	    131,108,0,0,0,3,107,0,1,49,107,0,1,50,107,0,1,51,106
    	]);
    })
    /*
    
    Am thinking probably don't support small int arrays. In a dynamic
    language this may not make sense.
    .should('encode small int arrays', function(){
        expect(Bert.binary_to_list(Bert.encode([1,2,3]))).toEqual([
    	    131,107,0,3,1,2,3
    	]);
    })
    
    .should('decode small int arrays', function(){
        expect(Bert.decode(Bert.bytes_to_string([131,107,0,3,1,2,3]))).toEqual([1,2,3])
    })
    */
    .should('encode assoc arrays', function(){
        expect(Bert.binary_to_list(Bert.encode({a : 1, b : 2, c : 3}))).toEqual([
            131,108,0,0,0,3,104,2,100,0,1,97,97,1,104,2,100,0,1,98,97,2,104,2,100,0,1,99,97,3,106
            ])
    })
    .should('encode tuple', function(){
        expect(Bert.binary_to_list(Bert.encode(Bert.tuple("Hello", 1)))).toEqual([
            131,104,2,107,0,5,72,101,108,108,111,97,1
            ])
    })
    .should('encode empty list', function(){
        expect(Bert.binary_to_list(Bert.encode([]))).toEqual([
            131,106
            ])
    })
    .should('encode complex', function(){
        expect(Bert.binary_to_list(Bert.encode({
    		a : Bert.tuple(1, 2, 3),
    		b : [400, 5, 6]
    	}))).toEqual([
            131,108,0,0,0,2,104,2,100,0,1,97,104,3,97,1,97,2,97,3,104,2,100,0,1,98,108,0,0,0,3,98,0,0,1,144,97,5,97,6,106,106
            ])
    })
    .should('decode complex', function(){
        
        var term = Bert.decode(Bert.bytes_to_string([131, 108, 0, 0, 0, 4, 104, 2, 100, 0, 4, 97, 116, 111, 109, 100, 0, 6, 109, 121, 65, 116, 111, 109, 104, 2, 100, 0, 6, 98, 105, 110, 97, 114, 121, 109, 0, 0, 0, 9, 77, 121, 32, 66, 105, 110, 97, 114, 121, 104, 2, 100, 0, 4, 98, 111, 111, 108, 100, 0, 4, 116, 114, 117, 101, 104, 2, 100, 0, 6, 115, 116, 114, 105, 110, 103, 107, 0, 11, 72, 101, 108, 108, 111, 32, 116, 104, 101, 114, 101, 106]))
        expect(Bert.pp_term(term)).toBe('{atom,myAtom},{binary,<<"My Binary">>},{bool,true},{string,Hello there}')
        
    })
    .should('decode negative ints', function(){
        expect(Bert.decode(Bert.bytes_to_string([131,98,255,255,255,255]))).toBe(-1)
    })
    .should('decode ints', function(){
        var term = Bert.decode(Bert.bytes_to_string([131, 108, 0, 0, 0, 5, 104, 2, 100, 0, 13, 115, 109, 97, 108, 108, 95, 105, 110, 116, 101, 103, 101, 114, 97, 42, 104, 2, 100, 0, 8, 105, 110, 116, 101, 103, 101, 114, 49, 98, 0, 0, 19, 136, 104, 2, 100, 0, 8, 105, 110, 116, 101, 103, 101, 114, 50, 98, 255, 255, 236, 120, 104, 2, 100, 0, 8, 98, 105, 103, 95, 105, 110, 116, 49, 110, 4, 0, 177, 104, 222, 58, 104, 2, 100, 0, 8, 98, 105, 103, 95, 105, 110, 116, 50, 110, 4, 1, 177, 104, 222, 58, 106]));
        expect(Bert.pp_term(term)).toBe('{small_integer,42},{integer1,5000},{integer2,-5000},{big_int1,987654321},{big_int2,-987654321}')
    })
    .should('decode floats', function(){
        
    	// Try decoding this: -3.14159
    	var term = Bert.decode(Bert.bytes_to_string([131, 99, 45, 51, 46, 49, 52, 49, 53, 56, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 56, 56, 50, 54, 50, 101, 43, 48, 48, 0, 0, 0, 0]));
        expect(term).toBe(-3.14159);

    	
    })
    .should('decode empty list', function(){
    	var term = Bert.decode(Bert.bytes_to_string([131, 106]));
        expect(Bert.pp_term(term)).toEqual([]);
    })