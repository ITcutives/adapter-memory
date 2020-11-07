/**
 * Created by ashish on 17/5/17.
 */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const Abstract = require('../src/abstract');

chai.use(sinonChai);
chai.use(chaiAsPromised);

chai.should();

Abstract.FIELDS = ['id', 'a', 'b', 'jsonfield'];

describe('abstract', () => {
  describe('constructor', () => {
    it('should set properties that matches field names', () => {
      const model = new Abstract({ a: 1, b: 2, c: 3 });
      model.properties.should.be.eql({ a: 1, b: 2 });
    });

    it('should set nested properties (json-path) correctly', () => {
      const model = new Abstract({ a: 1, 'b.c': 2 });
      model.properties.should.be.deep.eql({ a: 1 });
    });

    it('should set nested properties (json-object) correctly', () => {
      const model = new Abstract({ a: 1, b: { c: 2 } });
      model.properties.should.be.deep.eql({ a: 1, b: { c: 2 } });
    });
  });

  describe('debug', () => {
    let spy;

    beforeEach(() => {
      spy = sinon.spy(console, 'log');
    });

    afterEach(() => {
      // eslint-disable-next-line no-console
      console.log.restore();
    });

    it('should log message when debug flag is true', () => {
      process.env.debug = 'true';
      Abstract.debug('hello');
      spy.should.have.callCount(1);
    });

    it('should not log message when debug flag is false', () => {
      process.env.debug = false;
      Abstract.debug('hello');
      spy.should.have.callCount(0);
    });

    it('should not log message when environment variable is not set', () => {
      process.env.debug = undefined;
      Abstract.debug('hello');
      spy.should.have.callCount(0);
    });
  });

  describe('STATIC CONN', () => {
    it('should assign static property to class', () => {
      const conn = {
        CONNECT: true,
      };
      Abstract.CONN = conn;
      Abstract.connection.should.be.deep.eql(conn);
    });

    it('should return assigned static property to class', () => {
      const conn = {
        CONNECT: true,
      };
      Abstract.CONN = conn;
      Abstract.CONN.should.be.deep.eql(conn);
    });
  });

  describe('STATIC PAGESIZE', () => {
    it('should return static value', () => {
      Abstract.PAGESIZE.should.be.eql(100);
    });
  });

  describe('setContext', () => {
    let abstract;

    beforeEach(() => {
      abstract = new Abstract({});
    });

    it('should set correct context', () => {
      abstract.setContext({ uuid: '1111' });
      abstract.context.should.be.deep.eql({ uuid: '1111' });
    });
  });

  describe('getContext', () => {
    let abstract;

    beforeEach(() => {
      abstract = new Abstract({});
    });

    it('should get correct context', () => {
      abstract.context = { uuid: '1111' };
      abstract.getContext().should.be.deep.eql({ uuid: '1111' });
    });
  });

  describe('setDatabase', () => {
    let abstract;

    beforeEach(() => {
      abstract = new Abstract({});
    });

    it('should set correct database', () => {
      abstract.setDatabase('mysql_0001_db');
      abstract.database.should.be.eql('mysql_0001_db');
    });
  });

  describe('getDatabase', () => {
    let abstract;

    beforeEach(() => {
      abstract = new Abstract({});
    });

    it('should get correct database', () => {
      abstract.database = 'mysql_0001_db';
      abstract.getDatabase().should.be.eql('mysql_0001_db');
    });
  });

  describe('setOriginal', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
      Abstract.FIELDS = ['id', 'name'];
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should assign the attribute original with argument provided', () => {
      const b = new Abstract({ id: 1, name: 'b' });
      a.setOriginal(b);
      a.original.should.be.deep.eql(b);
    });

    it('should not assign the attribute original if argument has different constructor then instance', () => {
      const b = { id: 1, name: 'b' };
      a.setOriginal(b);
      (a.original === undefined).should.be.eql(true);
    });
  });

  describe('getChanges', () => {
    let a;

    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name', 'view', 'index', 'config.test'];
      a = new Abstract({
        id: 1, name: 'AA', view: false, index: 0, config: { test: 'abc' },
      });
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should return changes if found between original and current', () => {
      const b = new Abstract({
        id: 1, name: 'b', view: true, index: 1, config: { test: 'xyz' },
      });
      a.setOriginal(b);
      a.getChanges().should.be.deep.eql({
        name: 'AA', view: false, index: 0, config: { test: 'abc' },
      });
    });

    it('should return empty object if no changes spotted', () => {
      const b = new Abstract({
        id: 1, name: 'AA', view: false, index: 0, config: { test: 'abc' },
      });
      a.setOriginal(b);
      a.getChanges().should.be.deep.eql({});
    });
  });

  describe('set', () => {
    let a;

    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name', 'json.field'];
      a = new Abstract();
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should assign the property with empty object if properties is not defined', () => {
      a.properties = undefined;
      a.set('attribute', '1');
      a.properties.should.be.deep.eql({});
    });

    it('should assign the properties with key/value if key is valid field', () => {
      a.set('id', '2');
      a.properties.should.be.deep.eql({ id: '2' });
    });

    it('should set the properties with key/value for nested field', () => {
      a.set('json.field', '2');
      a.properties.should.be.deep.eql({ json: { field: '2' } });
    });
  });

  describe('get', () => {
    let a;

    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name', 'json.field'];
      a = new Abstract();
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should return undefined if properties is not defined', () => {
      a.properties = undefined;
      (a.get('id') === undefined).should.be.eql(true);
    });

    it('should return undefined the properties with key is not assigned yet', () => {
      a.set('id', '2');
      (a.get('name') === undefined).should.be.eql(true);
    });

    it('should return value associated with key', () => {
      a.set('id', '2');
      a.get('id').should.be.eql('2');
    });

    it('should return value associated with key (jsonPath)', () => {
      a.set('json.field', '2');
      a.get('json.field').should.be.eql('2');
    });
  });

  describe('remove', () => {
    let a;

    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name', 'json.field'];
      a = new Abstract();
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should not do anything if property is not defined', () => {
      a.properties = undefined;
      a.remove('id').should.be.eql(false);
    });

    it('should try and remove the property provided', () => {
      a.set('id', '2');
      a.remove('id').should.be.eql(true);
      a.properties.should.be.deep.eql({});
    });

    it('should try and remove the property provided (json path)', () => {
      a.set('id', '2');
      a.set('json.field', '2');
      a.properties.should.be.deep.eql({ id: '2', json: { field: '2' } });
      a.remove('json.field').should.be.eql(true);
      a.properties.should.be.deep.eql({ id: '2', json: {} });
    });
  });

  describe('toLink', () => {
    let a;

    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name'];
      a = new Abstract({ id: 'A001', name: 'ashish' });
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should resolve with properties of object', (done) => {
      a.toLink().should.eventually.deep.eql({ id: 'A001', name: 'ashish' }).notify(done);
    });
  });

  describe('STATIC fromLink', () => {
    beforeEach(() => {
      Abstract.FIELDS = ['id', 'name'];
    });

    afterEach(() => {
      Abstract.FIELDS = [];
    });

    it('should resolve with properties of object', (done) => {
      Abstract.fromLink(Abstract, { id: 'A001', name: 'ashish' }).should.eventually.deep.eql(new Abstract({
        id: 'A001',
        name: 'ashish',
      })).notify(done);
    });
  });

  describe('query', () => {
    let a;
    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.query();
      }).should.throw('[adapter] `query` method not implemented');
    });
  });

  describe('getTableName', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.getTableName();
      }).should.throw('[adapter] `getTableName` method not implemented');
    });
  });

  describe('SELECT', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.SELECT();
      }).should.throw('[adapter] `SELECT` method not implemented');
    });
  });

  describe('COUNT', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.COUNT();
      }).should.throw('[adapter] `COUNT` method not implemented');
    });
  });

  describe('INSERT', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.INSERT();
      }).should.throw('[adapter] `INSERT` method not implemented');
    });
  });

  describe('UPDATE', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.UPDATE();
      }).should.throw('[adapter] `UPDATE` method not implemented');
    });
  });

  describe('DELETE', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.DELETE();
      }).should.throw('[adapter] `DELETE` method not implemented');
    });
  });

  describe('FINDLINKS', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.FINDLINKS();
      }).should.throw('[adapter] `FINDLINKS` method not implemented');
    });
  });

  describe('DELETELINK', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.DELETELINK();
      }).should.throw('[adapter] `DELETELINK` method not implemented');
    });
  });

  describe('SAVELINK', () => {
    let a;

    beforeEach(() => {
      a = new Abstract();
    });

    it('should throw exception', () => {
      (() => {
        a.SAVELINK();
      }).should.throw('[adapter] `SAVELINK` method not implemented');
    });
  });
});
