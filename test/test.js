'use strict';

var expect = require('chai').expect;
var clone = require('../dist/fclone.js');

describe('safeCloneDeep', function(){
  var input, output;

  beforeEach(function(){
    var a = {};
    a.a = a;
    a.b = {};
    a.b.a = a;
    a.b.b = a.b;
    a.c = {};
    a.c.b = a.b;
    a.c.c = a.c;
    a.x = 1;
    a.b.x = 2;
    a.c.x = 3;
    a.d = [0,a,1,a.b,2,a.c,3];
    input = a;
  });

  describe('irregular objects', function(){
    it('will clone a Date', function(){
      var a = new Date();
      var b = clone(a);
      expect(a).to.deep.equal(b);
      expect(a).to.not.equal(b);
    });

    it ('will clone a Buffer', function(){
      var a = new Buffer('this is a test');
      var b = clone(a);
      expect(a.toString()).to.equal(b.toString());
      expect(a).to.not.equal(b);
    });

    it ('will clone an Error\'s properties', function(){
      var a = new Error("this is a test");
      var b = clone(a);

      expect(a).to.not.equal(b);
      expect(b).to.have.property('name',a.name);
      expect(b).to.have.property('message',a.message);
      expect(b).to.have.property('stack',a.stack);
    });

    it('will clone an inherited property', function(){
      function Base(){
        this.base = true;
      }
      function Child(){
        this.child = true;
      }
      Child.prototype = new Base();

      var z = clone(new Child());
      expect(z).to.have.property('child',true);
      expect(z).not.to.have.property('base');
    });
  });

  describe('default circularValue of undefined', function(){
    beforeEach(function(){
      output = clone(input);
    });

    it('will return the expected values on base object', function(){
      expect(output).to.have.property('a','[Circular]');
      expect(output).to.have.property('b');
      expect(output).to.have.property('x',1);
      expect(output).to.have.property('c');
    });

    it('will return the expected values on nested property', function(){
      expect(output.b).to.exist;
      expect(output.b).to.have.property('a','[Circular]');
      expect(output.b).to.have.property('b','[Circular]');
      expect(output.b).to.have.property('x',2);
    });

    it('will return the expected values on secondary nested property', function(){
      expect(output.c).to.exist;
      expect(output.c).to.not.have.property('a');
      expect(output.c).to.have.property('b');
      expect(output.c).to.have.property('c','[Circular]');
      expect(output.c.b).to.deep.equal({a: '[Circular]', b: '[Circular]', x: 2});
      expect(output.c).to.have.property('x',3);
    });
  });

  it('clones', function() {
   var t = {foo: 'bar', bar: 'foo'}
   var o = clone(t)

   delete t.foo

   expect(t.foo).to.be.undefine
   expect(o.foo).to.equal('bar')
  })
});
