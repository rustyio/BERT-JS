/*
Copyright (c) 2010, Toby Ho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


describe = function(name, options){
	var spec = new describe.Spec(describe.specs.length, name, options)
	describe.specs.push(spec)
	return spec
}

describe.Spec = function(idx, name, options){
    this.idx = idx
    this.options = options
	this.name = name
	this.tests = []
	this.next = 0
}
describe.Spec.prototype = {
    before: function(arg1, arg2){
        var options, f
        if (typeof(arg1) == 'function'){
            f = arg1
            options = this.options
        }else if (typeof(arg1) == 'object'){
            options = arg1
            options.__proto__ = this.options
            f = arg2
        }
        f.options = options || {}
    	this._before = f
    	return this
    },
    beforeAll: function(f){
    	this._beforeAll = f
    	return this
    },
    after: function(f){
        this._after = f
        return this
    },
    afterAll: function(f){
        this._afterAll = f
        return this
    },
    it: function(name, arg2, arg3){
        return this.__newTest__('it ' + name, arg2, arg3)
    },
    should: function(name, arg2, arg3){
        return this.__newTest__('should ' + name, arg2, arg3)
    },
    __newTest__: function(name, arg2, arg3){
        var testFunc, options
        if (typeof(arg2) == 'function'){
            options = this.options
            testFunc = arg2
        }else if (typeof(arg2) == 'object'){
            arg2.__proto__ = this.options
            options = arg2
            testFunc = arg3
        }
    	this.tests.push(new describe.Test(this, this.tests.length, name, testFunc, options))
    	return this
    },
    run: function(){
        if (this.next == 0){
            //describe.print('begin: ' + this)
        }
        //describe.print('run: ' + this)
        /*
        if ('async tests' == this.name || 'befores and afters async' == this.name){
            try{
                throw new Error("Blah")
            }catch(e){
                describe.print(e.stack)
            }
        }
        */
    	if (this.next == 0 && this._beforeAll)
    	    this._beforeAll()
    	
    	this.runOne(this.next)
    	//this.tryFinish()
        if (this.finished && !this.handledFinish){
            
            this.handledFinish = true
            //describe.print(this + ' is finished')   
            describe.runNext()
        }
    },
    runNext: function(){
        this.next++
        if (this.next >= this.tests.length){
            this.tryFinish()
            if (this.finished && !this.handledFinish){
                this.handledFinish = true
                describe.runNext()
            }
            return
        }else
            this.run()
    },
    runOne: function(idx){
		var testCase = this.tests[idx]
		testCase.start()
    },
    printError: function(test, error){
        with(describe){
            print(this.name + ' ' + test.name + ':')
            if (error.message == 'Timed out')
                print('    ' + error)
            else{
                print('    ' + error)
                var lines = error.stack.split('\n')
                if (lines[0] == String(error))
                    lines = lines.slice(1)
                //lines = lines.slice(0, 3).map(function(p){return '    ' + p})
                
                print(lines.join('\n'))
            }
        }
    },
    tryFinish: function(){
        var summary = this.getSummary()
        if (summary){
        	if (this._afterAll) this._afterAll()
            with(describe){
                for (var i = 0; i < summary.failures.length; i++){
                    var idx = summary.failures[i]
                    var test = this.tests[idx]
                    var result = test.result
                    if (describe.showErrors)
                        this.printError(test, result.error)
                }
                print('Ran ' + summary.total + ' specs for ' + this + '.')
                print(summary.failures.length + ' failures.')
                describe.specDone[this.idx] = true
                this.finished = true
            }
        }
    },
    getSummary: function(){
        var failures = []
        for (var i = 0; i < this.tests.length; i++){
            var result = this.tests[i].result
            if (!result) return null
            if (!result.passed) failures.push(i)
        }
        return {total: this.tests.length, failures: failures}
    },
    toString: function(){
        return 'Spec(' + this.name + ')'
    }
}

describe.Test = function(spec, idx, name, func, options){
    this.spec = spec
    this.idx = idx
    this.name = name
    this.testFunc = func
    this.status = 0
    this.options = options || {}
    if (this.options.asyncTimeout && !this.options.async)
        this.options.async = true
    this.__proto__ = {
        reportResult: function(result){
            //describe.print(result + ',' + this)
            if (this.result == undefined){
                this.result = result
                this.setState('done')
                this.teardown()
            }
        },
        setState: function(state){
            this.state = state
            this.__proto__.__proto__ = describe.Test.States[state]
        },
        run: function(){
            //describe.print('Running test: ' + this)
            var self = this
		    this.setState('running')
		    try{
		        this.testFunc()
		        
            	if (this.options.async){
        		    var timeout = this.options.asyncTimeout || 1000
        		    setTimeout((function(test){
        		        return function(){
        		            self.fail('Timed out')
        		        }
        		    })(this), timeout)
        		}else
        		    this.reportResult(new describe.TestResult())
	        }catch(e){
	            this.reportResult(new describe.TestResult(e))
	        }
        },
        teardown: function(){
            var self = this
            if (this.spec._after){
                this.setState('teardown')
                this.spec._after.call(this)
                if (!this.options.async)
                    this.spec.runNext()
            }else{
                this.spec.runNext()
            }
        },
        fail: function(reason){
            this.reportResult(new describe.TestResult(new Error(reason)))
        },
        expect: function(one, context){
            return new describe.Assertion(this, one, context)
        },
        toString: function(){
            return this.spec.name + ' ' + this.name
        },
        __proto__: describe.Test.States.initial
    }
}

describe.Test.States = {
    initial: {
        start: function(){
		    //describe.print('start: ' + this)
            var self = this
			if (this.spec._before){
    			this.setState('setup')
    			try{
			        this.spec._before.call(this)
			    }catch(e){
			        this.reportResult(new describe.TestResult(e))
			    }
    		    var timeout = this.options.asyncTimeout || 1000
    		    setTimeout((function(test){
    		        return function(){
    		            if (self.state == 'setup')
    		                self.fail('Timed out during setup')
    		        }
    		    })(this), timeout)
			    if (!this.spec._before.options.async)
			        this.run()
			}else{
			    this.run()
			}
        }
    },
    setup: {
        finish: function(){
            this.run()
        }
    },
    running: {
        finish: function(){
            this.reportResult(new describe.TestResult())
        }
    },
    done: {
        finish: function(){}
    },
    teardown: {
        finish: function(){
            this.spec.runNext()
        }
    }
    
}

describe.TestResult = function(error){
    this.error = error
    this.passed = !Boolean(this.error)
}
describe.TestResult.prototype.toString = function toString(){
    return 'TestResult(' + this.error + ')'
}

describe.specs = []
describe.Assertion = function(test, one, context){
    this.test = test
    this.one = one
    this.context = context
}
describe.Assertion.prototype = {
    toEqual: function(other){
        var e = null
        var one = this.one
        if ((one && one.constructor === Date) && 
            (other && other.constructor === Date)){
            one = one.getTime()
            other = other.getTime()
        }
        else if ((one && one.constructor === Array) && 
            (other && other.constructor === Array)){
            if (one.length != other.length)
                error = new Error("Expected " + other + " but got " + one)
            for (var i = 0; i < one.length; i++)
                if (one[i] != other[i])
                    e = new Error("Expected " + other + " but got " + one)
        }
        else if ((one && one.constructor === Object) && 
            (other && other.constructor === Object)){
          function listRepr(obj){
            var ret = []
            for (var key in obj){
              ret.push(key + ':' + obj[key])
            }
            return ret
          }
          e = this.test.expect(listRepr(one)).toEqual(listRepr(other))
        }
        else if (one != other)
            e = Error("Expected " + other + " but got " + one)
        if (e != null){
            if (this.test && this.test.options.async)
                this.test.reportResult(new describe.TestResult(e))
            else
                throw e
        }
    },
    toBe: function(other){
        var one = this.one
        if (one !== other){
            var e = new Error("Expected " + other + " but got " + one)
            if (this.test && this.test.options.async)
                this.test.reportResult(new describe.TestResult(e))
            else
                throw e
        }
    },
    notToBe: function(other){
        var one = this.one
        if (one === other){
            var e = new Error("Expected not " + other + " but got " + one)
            if (this.test && this.test.options.async)
                this.test.reportResult(new describe.TestResult(e))
            else
                throw e
        }
    },
    toRaise: function(msg){
        var one = this.one
        var through = false
        try{
            one.apply(this.context)
            through = true
            throw new Error("Should have raised: " + msg)
        }catch(e){
            if (through){
                if (this.test && this.test.options.async)
                    this.test.reportResult(new describe.TestResult(e))
                else
                    throw e
            }
            else if (msg !== undefined){
                if (this.test){
                    this.test.expect(e.message).toEqual(msg)
                }else{
                    expect(e.message).toEqual(msg)
                }
            }
        }
    }
}

expect = function expect(one, context){
    return new describe.Assertion(null, one, context);
}

fail = function fail(reason){
    throw new Error(reason || 'Failed');
};
describe.print = function(msg){
  if (console && console.log)
        console.log(msg);
}
describe.showErrors = true
describe.runOneSpec = function(){
	var res = spec.run()
}
describe.next = 0
describe.specDone = []

describe._run = function(){
    if (this.next < this.specs.length){
        var spec = this.specs[this.next]
        spec.run()
    }
}

describe.runNext = function(){
    //describe.print('describe.runNext()')
    this.next++
    this._run()
}
describe.run = function(options){
    var options = options || {}
    if ('printTo' in options)
        describe.print = function(msg){
            function escape(s){
              if (!s || s.length == 0) return s;
              return s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            }
            document.getElementById(options.printTo).innerHTML += escape(msg) + '<br>';
        }
    else if ('print' in options)
        describe.print = options.print
    else
        describe.print = function(){}
    if ('showErrors' in options)
        describe.showErrors = options.showErrors
    this._run()
	return describe
}