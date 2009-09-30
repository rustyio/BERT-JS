<h1>BERT-JS</h1>

<h2>What is BERT?</h2>
BERT (Binary ERlang Term) is a format created by the Erlang development team for serializing Erlang terms, and promoted by Tom Preston-Werner as a way for different languages to communicate in a simple and efficient manner.

<a href="http://www.erlang-factory.com/upload/presentations/36/tom_preston_werner_erlectricity.pdf">Read Tom's Slides</a>


<h2>What is BERT JS?</h2>

BERT-JS is a first cut Javascript implementation of the BERT protocol. In other words, using BERT-JS, you can serialize data into a binary format that can then be de-serialized by Erlang directly into an Erlang term. (Or, by Ruby, as Tom has written a BERT library for Ruby.) 

<h2>Limitations</h2>

* Decoding floats is not yet supported.

<h2>Interface</h2>

* <b>Bert.encode(Object)</b> - Encode a Javascript object into BERT, return a String. The object can be a Boolean, Integer, Float, String, Array, Associative Array, or an Atom, Binary, or Tuple. (with the help of Bert.atom(), Bert.binary(), or Bert.tuple(), respectively).
* <b>Bert.decode(String)</b> - Decode a BERT string into a Javascript object. Atoms, Binaries, and Tuples are special objects. See code for structure.
* <b>Bert.atom(String)</b> - Create a Javascript object that will be encoded to an Atom.
* <b>Bert.binary(String)</b> - Create a Javascript object that will be encoded to an Binary.
* <b>Bert.tuple(Element1, Element2, Element3, ...)</b> - Create a Javascript object that will be encoded to a Tuple.
<h2>Examples</h2>

Note, below the return value is given in the form of an Erlang binary which can be fed into Erlang's binary_to_term/1. In reality, this returns a Javascript String with the ASCII values of the binary. 

	Bert.encode(Bert.atom("hello"));
	Returns: <<131,100,0,5,104,101,108,108,111>>
	Erlang: hello
	
	Bert.encode(Bert.binary("hello"));
	Returns: <<131,109,0,0,0,5,104,101,108,108,111>>
	Erlang: <<"hello">>
	
	Bert.encode(true);
	Returns: <<131,100,0,4,116,114,117,101>>
	Erlang: true
	
	Bert.encode(42);
	Returns: <<131,97,42>>
	Erlang: 42
	
	Bert.encode(5000);
	Returns: <<131,98,0,0,19,136>>
	Erlang: 5000
	
	Bert.encode(-5000);
	Returns: <<131,98,255,255,236,120>>
	Erlang: -5000
	
	Bert.encode(987654321);
	Returns: <<131,110,4,0,177,104,222,58>>
	Erlang: 987654321
	
	Bert.encode(-987654321);
	Returns: <<131,110,4,1,177,104,222,58>>
	Erlang: -987654321
	
	Bert.encode(3.14159);
	Returns: <<131,99,51,46,49,52,49,53,57,101,43,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0>>
	Erlang: 3.14159
	
	Bert.encode(-3.14159);
	Returns: <<131,99,45,51,46,49,52,49,53,57,101,43,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0>>
	Erlang: -3.14159
	
	Bert.encode([1, 2, 3]);
	Returns: <<131,108,0,0,0,3,97,1,97,2,97,3,106>>
	Erlang: [1,2,3]
	
	Bert.encode({a:1, b:2, c:3});
	Returns: <<131,108,0,0,0,3,104,2,100,0,1,97,97,1,104,2,100,0,1,98,97,2,104,2,100,0,1,99,97,3,106>>
	Erlang: [{a,1},{b,2},{c,3}]
	
	Bert.encode(Bert.tuple("Hello", 1));
	Returns: <<131,104,2,107,0,5,72,101,108,108,111,97,1>>
	Erlang: {"Hello",1}
	
	Bert.encode({
		a : Bert.tuple(1, 2, 3),
		b : [4,5,6]
	});
	Returns: <<131,108,0,0,0,2,104,2,100,0,1,97,104,3,97,1,97,2,97,3,104,2,100,0,1,98,108,0,0,0,3,97,4,97,5,97,6,106,106>>
    Erlang: [{a,{1,2,3}},{b,[4,5,6]}]
    
    var S = Bert.bytes_to_string([131,108,0,0,0,3,104,2,100,0,4,97,116,111,109,100,0,6,109,121,65,116,111,109,
        104,2,100,0,6,98,105,110,97,114,121,109,0,0,0,9,77,121,32,66,105,110,97,114,
        121,104,2,100,0,4,98,111,111,108,100,0,4,116,114,117,101,106]);
    var Obj = Bert.decode(S);
    Object is equiv to: [{atom,myAtom},{binary,<<"My Binary">>},{bool,true},{string,"Hello there"}]
    
    var S = Bert.bytes_to_string([131,108,0,0,0,5,104,2,100,0,13,115,109,97,108,108,95,105,110,116,101,103,101,
        114,97,42,104,2,100,0,8,105,110,116,101,103,101,114,49,98,0,0,19,136,104,2, 100,0,8,105,110,116,101,103,
        101,114,50,98,255,255,236,120,104,2,100,0,8,98,105,103,95,105,110,116,49,110,4,0,177,104,222,58,104,2,
        100,0,8,98,105,103,95,105,110,116,50,110,4,1,177,104,222,58,106]);
    var Obj = Bert.decode(S);
    Object is equiv to: [{small_integer,42},{integer1,5000},{integer2,-5000},{big_int1,987654321},{big_int2,-987654321}]