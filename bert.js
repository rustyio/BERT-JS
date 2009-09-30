// BERT-JS
// Javascript Implementation of Binary Erlang Term Serialization.
// http://github.com/rklophaus/BERT-JS
// Copyright (c) 2009 Rusty Klophaus (@rklophaus)
// See MIT-LICENSE for licensing information.

function BertClass() { 
}

function BertAtom(Obj) {
	this.type = "Atom";
	this.value = Obj;
}

function BertBinary(Obj) {
	this.type = "Binary";
	this.value = Obj;
}

function BertTuple(Arr) {
	this.type = "Tuple";
	this.length = Arr.length;
	for (var i=0; i<Arr.length; i++) {
		this[i] = Arr[i];
	}
	return "";
}

BertClass.prototype.atom = function(Obj) {
	return new BertAtom(Obj);
}

BertClass.prototype.binary = function(Obj) {
	return new BertBinary(Obj);
}

BertClass.prototype.tuple = function() {
	return new BertTuple(arguments);
}

BertClass.prototype.encode = function(Obj) {
	return String.fromCharCode(131) + this.encode_inner(Obj);
}

BertClass.prototype.encode_inner = function(Obj) {
	var type = typeof(Obj);
	return eval("this.encode_" + type + "(Obj)");
}

BertClass.prototype.encode_string = function(Obj) {
	return String.fromCharCode(107) + this.to_bytes(Obj.length, 2) + Obj;
}

BertClass.prototype.encode_boolean = function(Obj) {
	if (Obj) {
		return this.to_string([100,0,4,116,114,117,101]);
	} else {
		return this.to_string([100,0,5,102,97,108,115,101]);
	}
}

BertClass.prototype.encode_number = function(Obj) {
	IsInteger = (Obj % 1 == 0)
	
	// Handle floats...
	if (!IsInteger) {
		return this.encode_float(Obj);
	}
	
	// Small int...
	if (IsInteger && Obj >= 0 && Obj < 256) { 
		return String.fromCharCode(97) + this.to_bytes(Obj, 1);
	}
	
	// 4 byte int...
	if (IsInteger && Obj >= -134217728 && Obj <= 134217727) {
		return String.fromCharCode(98) + this.to_bytes(Obj, 4);
	} 
	
	// Bignum...
	var s = this.to_bignum(Obj);
	if (s.length < 256) { 
		return String.fromCharCode(110) + this.to_bytes(s.length - 1, 1) + s;
	} else {
		return String.fromCharCode(111) + this.to_bytes(s.length - 1, 4) + s;
	}
}

BertClass.prototype.encode_float = function(Obj) {
	// float...
	var s = Obj.toExponential();
	while (s.length < 31) {
		s += String.fromCharCode(0);
	}
	return String.fromCharCode(99) + s;
}

BertClass.prototype.encode_object = function(Obj) {
	// Check if it's an atom, binary, or tuple...
	if (Obj.type == "Atom") return this.encode_atom(Obj);
	if (Obj.type == "Binary") return this.encode_binary(Obj);
	if (Obj.type == "Tuple") return this.encode_tuple(Obj);
	
	// Check if it's an array...
	var isArray = Obj.constructor.toString().indexOf("Array") != -1;
	if (isArray) return this.encode_array(Obj);

	// Treat the object as an associative array...
	return this.encode_associative_array(Obj);
}

BertClass.prototype.encode_atom = function(Obj) {
	return String.fromCharCode(100) + this.to_bytes(Obj.value.length, 2) + Obj.value;
}

BertClass.prototype.encode_binary = function(Obj) {
	return String.fromCharCode(109) + this.to_bytes(Obj.value.length, 4) + Obj.value;
}

BertClass.prototype.encode_tuple = function(Obj) {
	var s = "";
	if (Obj.length < 256) {
		s += String.fromCharCode(104) + this.to_bytes(Obj.length, 1);
	} else {
		s += String.fromCharCode(105) + this.to_bytes(Obj.length, 4);
	}
	for (var i=0; i<Obj.length; i++) {
		s += this.encode_inner(Obj[i]);
	}
	return s;
}

BertClass.prototype.encode_array = function(Obj) {
	var s = String.fromCharCode(108) + this.to_bytes(Obj.length, 4);
	for (var i=0; i<Obj.length; i++) {
		s += this.encode_inner(Obj[i]);
	}
	s += String.fromCharCode(106);
	return s;
}

BertClass.prototype.encode_associative_array = function(Obj) {
	var Arr = new Array();
	for (var key in Obj) {
		Arr.push(Bert.tuple(Bert.atom(key), Obj[key]));
	}
	return this.encode_array(Arr);
}

BertClass.prototype.to_bytes = function(Int, Count) {
	var isNegative = Int < 0;
	if (isNegative) { Int = ~Int; }
	var s = "";
	var OriginalInt = Int;
	for (var i=0; i<Count; i++) {
		var Rem = Int % 256;
		if (isNegative) Rem = 255 - Rem;
		s = String.fromCharCode(Rem) + s;
		Int = Math.floor(Int / 256);
	}
	if (Int > 0) throw("Argument out of range: " + OriginalInt);
	return s;
}

BertClass.prototype.to_bignum = function(Int) {
  var isNegative = Int < 0;
	var s = "";
	if (isNegative) { 
		Int *= -1; 
		s += String.fromCharCode(1);
	} else {
		s += String.fromCharCode(0);
	}
	
	while (Int != 0) {
		var Rem = Int % 256;
		s += String.fromCharCode(Rem);
		Int = Math.floor(Int / 256);
	}
	
	return s;
}

BertClass.prototype.to_string = function(Arr) {
	var s = "";
	for (var i=0; i<Arr.length; i++) {
		s += String.fromCharCode(Arr[i]);
	}
	return s;
}

BertClass.prototype.pp = function(Bin) {
	s = "";
	for (var i=0; i<Bin.length; i++) {
		if (s != "") s += ",";
		s += "" + String.charCodeAt(Bin[i]);
	}
	alert("<<" + s + ">>");
}

BertClass.prototype.test = function() {
	Bert.pp(Bert.encode(Bert.atom("hello")));
	Bert.pp(Bert.encode(Bert.binary("hello")));
	Bert.pp(Bert.encode(true));
	Bert.pp(Bert.encode(42));
	Bert.pp(Bert.encode(5000));
	Bert.pp(Bert.encode(-5000));
	Bert.pp(Bert.encode(987654321));
	Bert.pp(Bert.encode(-987654321));
	Bert.pp(Bert.encode(3.14159));
	Bert.pp(Bert.encode(-3.14159));
	Bert.pp(Bert.encode([1, 2, 3]));
	Bert.pp(Bert.encode({a:1, b:2, c:3}));
	Bert.pp(Bert.encode(Bert.tuple("Hello", 1)));
	Bert.pp(Bert.encode({
		a : Bert.tuple(1, 2, 3),
		b : [4, 5, 6]
	}));
}

var Bert = new BertClass();