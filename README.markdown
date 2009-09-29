<h1>BERT-JS</h1>

<h2>What is BERT?</h2>
BERT (Binary ERlang Term) is a format created by the Erlang development team for serializing Erlang terms, and espoused by Tom Preston-Werner as a way for different languages to speak to each other in a simple and efficient manner.

<a href="http://www.erlang-factory.com/upload/presentations/36/tom_preston_werner_erlectricity.pdf">Read Tom's Slides</a>

<h2>What is BERT JS?</h2>

BERT-JS is a first cut Javascript implementation of the BERT protocol. In other words, using BERT-JS, you can encode data into a binary format that can then be decoded by an Erlang VM. (Or, by Ruby, as Tom has written a BERT translator for Ruby.) 

Currently, BERT-JS can only encode from Javascript objects into BERT. It cannot yet decode.

<h2>Interface</h2>

* <b>Bert.encode(Object)</b> - Encode a Javascript object into BERT, return a String. The object can be a Boolean, Integer, Float, String, Array, Associative Array, or an Atom, Tuple, or Binary (with the help of Bert.atom(), Bert.tuple(), and Bert.binary(), respectively).

<h2>Examples</h2>

Note, below the return value is given in the form of an Erlang binary. In reality, this returns a Javascript String with the ASCII values of the binary. 

	Bert.encode(Bert.atom("hello"));
	Returns: <<131,100,0,5,104,101,108,108,111>>
	
	Bert.encode(Bert.binary("hello"));
	Returns: <<131,109,0,0,0,5,104,101,108,108,111>>
	
	Bert.encode(true);
	Returns: <<131,100,0,4,116,114,117,101>>
	
	Bert.encode(42);
	Returns: <<131,97,42>>
	
	Bert.encode(5000);
	Returns: <<131,98,0,0,19,136>>
	
	Bert.encode(-5000);
	Returns: <<131,98,255,255,236,120>>
	
	Bert.encode(987654321);
	Returns: <<131,110,4,0,177,104,222,58>>
	
	Bert.encode(-987654321);
	Returns: <<131,110,4,1,177,104,222,58>>
	
	Bert.encode(3.14159);
	Returns: <<131,99,51,46,49,52,49,53,57,101,43,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0>>
	
	Bert.encode(-3.14159);
	Returns: <<131,99,45,51,46,49,52,49,53,57,101,43,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0>>
	
	Bert.encode([1, 2, 3]);
	Returns: <<131,108,0,0,0,3,97,1,97,2,97,3,106>>
	
	Bert.encode({a:1, b:2, c:3});
	Returns: <<131,108,0,0,0,3,104,2,100,0,1,97,97,1,104,2,100,0,1,98,97,2,104,2,100,0,1,99,97,3,106>>
	
	Bert.encode(Bert.tuple("Hello", 1));
	Returns: <<131,104,2,107,0,5,72,101,108,108,111,97,1>>
	
	Bert.encode({
		a : Bert.tuple(1, 2, 3),
		b : [4, 5, 6]
	});
	Returns: <<131,108,0,0,0,2,104,2,100,0,1,97,104,3,97,1,97,2,97,3,104,2,100,0,1,98,108,0,0,0,3,97,4,97,5,97,6,106,106>>
