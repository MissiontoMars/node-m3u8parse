var expect = require('chai').expect;

var AttrList = require('../attrlist');

describe('AttrList', function() {

  it('constructor() supports empty arguments', function() {
    expect(new AttrList()).to.eql({});
    expect(new AttrList({})).to.eql({});
    expect(new AttrList(undefined)).to.eql({});
  })

  it('constructor() supports object argument', function() {
    var obj = { value: "42" };
    var list = new AttrList(obj);
    expect(list.decimalIntegerAsNumber('VALUE')).to.equal(42);
    expect(Object.keys(list)).to.have.length(1);
  })

  it('constructor() auto instantiates', function() {
    expect(AttrList()).to.be.instanceOf(AttrList);
  })

  it('toString() has valid output', function() {
    var list = new AttrList('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
    expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
    list.decimalIntegerAsNumber('extra', 123);
    expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2,EXTRA=123');
    list.extra = null;
    expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
  })

  describe('parsing', function () {

    it('parses valid decimalInteger attribute', function() {
      expect(new AttrList('INT=42').decimalIntegerAsNumber('INT')).to.equal(42);
      expect(new AttrList('INT=0').decimalIntegerAsNumber('INT')).to.equal(0);
    })

    it('parses valid hexadecimalInteger attribute', function() {
      expect(new AttrList('HEX=0x42').hexadecimalIntegerAsNumber('HEX')).to.equal(0x42);
      expect(new AttrList('HEX=0x0').hexadecimalIntegerAsNumber('HEX')).to.equal(0);
    })

    it('parses valid decimalFloatingPoint attribute', function() {
      expect(new AttrList('FLOAT=42.0').decimalFloatingPoint('FLOAT')).to.equal(42.0);
      expect(new AttrList('FLOAT=0.42').decimalFloatingPoint('FLOAT')).to.equal(0.42);
      expect(new AttrList('FLOAT=0').decimalFloatingPoint('FLOAT')).to.equal(0);
    })

    it('parses valid signedDecimalFloatingPoint attribute', function() {
      expect(new AttrList('FLOAT=42.0').signedDecimalFloatingPoint('FLOAT')).to.equal(42.0);
      expect(new AttrList('FLOAT=-42.0').signedDecimalFloatingPoint('FLOAT')).to.equal(-42.0);
      expect(new AttrList('FLOAT=0.42').signedDecimalFloatingPoint('FLOAT')).to.equal(0.42);
      expect(new AttrList('FLOAT=-0.42').signedDecimalFloatingPoint('FLOAT')).to.equal(-0.42);
      expect(new AttrList('FLOAT=0').signedDecimalFloatingPoint('FLOAT')).to.equal(0);
      expect(new AttrList('FLOAT=-0').signedDecimalFloatingPoint('FLOAT')).to.equal(-0);
    })

    it('parses valid quotedString attribute', function() {
      expect(new AttrList('STRING="hi"').quotedString('STRING')).to.equal('hi');
      expect(new AttrList('STRING=""').quotedString('STRING')).to.equal('');
    })

    it('parses exotic quotedString attribute', function() {
      var list = new AttrList('STRING="hi,ENUM=OK,RES=4x2"');
      expect(list.quotedString('STRING')).to.equal('hi,ENUM=OK,RES=4x2');
      expect(Object.keys(list)).to.have.length(1);
    })

    it('parses valid enumeratedString attribute', function() {
      expect(new AttrList('ENUM=OK').enumeratedString('ENUM')).to.equal('OK');
    })

    it('parses exotic enumeratedString attribute', function() {
      expect(new AttrList('ENUM=1').enumeratedString('ENUM')).to.equal('1');
      expect(new AttrList('ENUM=A=B').enumeratedString('ENUM')).to.equal('A=B');
      expect(new AttrList('ENUM=A=B=C').enumeratedString('ENUM')).to.equal('A=B=C');
      var list = new AttrList('ENUM1=A=B=C,ENUM2=42');
      expect(list.enumeratedString('ENUM1')).to.equal('A=B=C');
      expect(list.enumeratedString('ENUM2')).to.equal('42');
    })

    it('parses valid decimalResolution attribute', function() {
      expect(new AttrList('RES=400x200').decimalResolution('RES')).to.eql({ width:400, height:200 });
      expect(new AttrList('RES=0x0').decimalResolution('RES')).to.eql({ width:0, height:0 });
    })

    it('handles invalid decimalResolution attribute', function() {
      expect(new AttrList('RES=400x-200').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=400.5x200').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=400x200.5').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=400').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=400x').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=x200').decimalResolution('RES')).to.eql(undefined);
      expect(new AttrList('RES=x').decimalResolution('RES')).to.eql(undefined);
    });

    it('parses multiple attributes', function() {
      var list = new AttrList('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
      expect(list.decimalIntegerAsNumber('INT')).to.equal(42);
      expect(list.hexadecimalIntegerAsNumber('HEX')).to.equal(0x42);
      expect(list.decimalFloatingPoint('FLOAT')).to.equal(0.42);
      expect(list.quotedString('STRING')).to.equal('hi');
      expect(list.enumeratedString('ENUM')).to.equal('OK');
      expect(list.decimalResolution('RES')).to.eql({ width:4, height:2 });
      expect(Object.keys(list)).to.have.length(6);
    })

    it('handles missing attributes', function() {
      var list = new AttrList();
      expect(isNaN(list.decimalIntegerAsNumber('INT')));
      expect(isNaN(list.hexadecimalIntegerAsNumber('HEX')));
      expect(isNaN(list.decimalFloatingPoint('FLOAT')));
      expect(list.quotedString('STRING')).to.equal(undefined);
      expect(list.enumeratedString('ENUM')).to.equal(undefined);
      expect(list.decimalResolution('RES')).to.equal(undefined);
      expect(Object.keys(list)).to.have.length(0);
    })

    it('parses dashed attribute names', function() {
      var list = new AttrList('INT-VALUE=42,H-E-X=0x42,-FLOAT=0.42,STRING-="hi",ENUM=OK');
      expect(list.decimalIntegerAsNumber('INT-VALUE')).to.equal(42);
      expect(list.hexadecimalIntegerAsNumber('H-E-X')).to.equal(0x42);
      expect(list.decimalFloatingPoint('-FLOAT')).to.equal(0.42);
      expect(list.quotedString('STRING-')).to.equal('hi');
      expect(list.enumeratedString('ENUM')).to.equal('OK');
      expect(Object.keys(list)).to.have.length(5);
    })

    it('handles decimalInteger conversions', function() {
      var list = new AttrList('INT1=1234567890123456789,INT2=123,INT3=0');
      expect(list.decimalInteger('INT1')).to.eql(new Buffer([0x11,0x22,0x10,0xF4,0x7D,0xE9,0x81,0x15]));
      expect(list.decimalInteger('INT2')).to.eql(new Buffer([0x7b]));
      expect(list.decimalInteger('INT3')).to.eql(new Buffer([0x0]));
    })

    it('handles hexadecimalInteger conversions', function() {
      var list = new AttrList('HEX1=0x0123456789abcdef0123456789abcdef,HEX2=0x123,HEX3=0x0');
      expect(list.hexadecimalInteger('HEX1')).to.eql(new Buffer([0x01,0x23,0x45,0x67,0x89,0xab,0xcd,0xef,0x01,0x23,0x45,0x67,0x89,0xab,0xcd,0xef]));
      expect(list.hexadecimalInteger('HEX2')).to.eql(new Buffer([0x01,0x23]));
      expect(list.hexadecimalInteger('HEX3')).to.eql(new Buffer([0x0]));
    })

    it('returns infinity on large number conversions', function() {
      var list = new AttrList('VAL=1234567890123456789,HEX=0x0123456789abcdef0123456789abcdef');
      expect(list.decimalIntegerAsNumber('VAL')).to.equal(Infinity);
      expect(list.hexadecimalIntegerAsNumber('HEX')).to.equal(Infinity);
    })

  })

  describe('encoding', function () {

    function encode(method, value) {
      var list = new AttrList();
      list[method]('VALUE', value);
      return list.value;
    }

    it('encodes valid decimalInteger attribute', function() {
      expect(encode('decimalIntegerAsNumber', 42)).to.equal('42');
      expect(encode('decimalIntegerAsNumber', 0)).to.equal('0');
    })

    it('encodes valid hexadecimalInteger attribute', function() {
      expect(encode('hexadecimalIntegerAsNumber', 0x42)).to.equal('0x42');
      expect(encode('hexadecimalIntegerAsNumber', 0x0)).to.equal('0x0');
    })

    it('encodes valid decimalFloatingPoint attribute', function() {
      expect(encode('decimalFloatingPoint', 42.5)).to.equal('42.5');
      expect(encode('decimalFloatingPoint', 0.42)).to.equal('0.42');
      expect(encode('decimalFloatingPoint', 0)).to.equal('0');
    })

    it('encodes valid signedDecimalFloatingPoint attribute', function() {
      expect(encode('signedDecimalFloatingPoint', 42.5)).to.equal('42.5');
      expect(encode('signedDecimalFloatingPoint', 0.42)).to.equal('0.42');
      expect(encode('signedDecimalFloatingPoint', -0.42)).to.equal('-0.42');
      expect(encode('signedDecimalFloatingPoint', 0)).to.equal('0');
      expect(encode('signedDecimalFloatingPoint', -0)).to.equal('0');
    })

    it('encodes valid quotedString attribute', function() {
      expect(encode('quotedString', 'hi')).to.equal('"hi"');
      expect(encode('quotedString', '')).to.equal('""');
    })

    it('encodes exotic quotedString attribute', function() {
      expect(encode('quotedString', 'hi,ENUM=OK,RES=4x2')).to.equal('"hi,ENUM=OK,RES=4x2"');
    })

    it('encodes valid enumeratedString attribute', function() {
      expect(encode('enumeratedString', 'OK')).to.equal('OK');
    })

    it('encodes exotic enumeratedString attribute', function() {
      expect(encode('enumeratedString', '1')).to.equal('1');
      expect(encode('enumeratedString', 'A=B')).to.equal('A=B');
      expect(encode('enumeratedString', 'A=B=C')).to.equal('A=B=C');
    })

    it('encodes valid decimalResolution attribute', function() {
      expect(encode('decimalResolution', { width:400, height:200 })).to.equal('400x200');
      expect(encode('decimalResolution', { width:0, height:0 })).to.equal('0x0');
    })

    it('handles invalid decimalResolution attribute', function() {
      expect(encode('decimalResolution', {})).to.equal('NaNxNaN');
      expect(encode('decimalResolution', undefined)).to.equal('NaNxNaN');
    });

    it('handles decimalInteger conversions', function() {
      expect(encode('decimalInteger', new Buffer([0x11,0x22,0x10,0xF4,0x7D,0xE9,0x81,0x15]))).to.equal('1234567890123456789');
      expect(encode('decimalInteger', 123)).to.equal('123');
      expect(encode('decimalInteger', new Buffer([0x0]))).to.equal('0');
      expect(encode('decimalInteger', new Buffer(0))).to.equal('0');
      expect(encode('decimalInteger', 0)).to.equal('0');
    })

    it('handles hexadecimalInteger conversions', function() {
      expect(encode('hexadecimalInteger', new Buffer([0x01,0x23,0x45,0x67,0x89,0xab,0xcd,0xef,0x01,0x23,0x45,0x67,0x89,0xab,0xcd,0xef]))).to.equal('0x123456789abcdef0123456789abcdef');
      expect(encode('hexadecimalInteger', 0x123)).to.equal('0x123');
      expect(encode('hexadecimalInteger', new Buffer([0x0]))).to.equal('0x0');
      expect(encode('hexadecimalInteger', new Buffer(0))).to.equal('0x0');
      expect(encode('hexadecimalInteger', 0)).to.equal('0x0');
    })

  })

})
