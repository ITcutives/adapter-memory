/**
 * Created by ashishtilara on 29/5/17.
 */
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire');

const Adapter = proxyquire('../src/adapter', {
  'uuid/v1': () => 'random-uuid-v1',
});

const Memory = proxyquire('./extras/model', {
  '../../src/adapter': Adapter,
});
const Connection = require('../src/connection');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

describe('memory', () => {
  describe('constructor', () => {
    it('should set properties', () => {
      const memory = new Memory({
        id: '1234', name: 'ashish', age: 21, gender: 'male',
      });
      memory.properties.should.be.deep.eql({ id: '1234', name: 'ashish', age: 21 });
    });

    it('should initialise empty properties', () => {
      const memory = new Memory();
      memory.properties.should.be.deep.eql({});
    });
  });

  describe('SERIALIZED', () => {
    it('should be empty object by default', () => {
      Adapter.SERIALIZED.should.be.deep.eql({});
    });

    it('should be object with property name and encoding type', () => {
      Memory.SERIALIZED.should.be.deep.eql({
        jsonfield: 'json',
      });
    });
  });

  describe('LINKS', () => {
    beforeEach(() => {
      Memory.LINKS = [];
    });

    it('should be empty array by default', () => {
      Adapter.LINKS.should.be.deep.eql([]);
    });

    it('should be array with link information', () => {
      Memory.LINKS.should.be.deep.eql([]);
    });
  });

  describe('PLURAL', () => {
    beforeEach(() => {
      Memory.PLURAL = 'models';
    });

    it('should be empty string by default', () => {
      Adapter.PLURAL.should.be.deep.eql('');
    });

    it('should be correct plural', () => {
      Memory.PLURAL.should.be.deep.eql('models');
    });
  });

  describe('TABLE', () => {
    beforeEach(() => {
      Memory.TABLE = 'table';
    });

    it('should be empty string by default', () => {
      Adapter.TABLE.should.be.deep.eql('');
    });

    it('should be correct table name', () => {
      Memory.TABLE.should.be.deep.eql('table');
    });
  });

  describe('FIELDS', () => {
    it('should be empty string by default', () => {
      Adapter.FIELDS.should.be.deep.eql([]);
    });

    it('should be list of fields', () => {
      Memory.FIELDS.should.be.deep.eql(['id', 'name', 'jsonfield', 'age']);
    });
  });


  describe('INSERT', () => {
    let memory;
    let connection;

    beforeEach(() => {
      memory = new Memory({});
      Memory.TABLE = 'table';
      connection = new Connection();
      Memory.CONN = connection;
    });

    it('resolve with success', (done) => {
      memory.set('name', 'ashish');
      memory.INSERT().then((id) => {
        connection.database.should.have.property(Memory.TABLE);
        connection.database[Memory.TABLE].length.should.be.eql(1);
        id.should.be.eql('random-uuid-v1');
        connection.database[Memory.TABLE][0].should.be.deep.eql({ id: 'random-uuid-v1', name: 'ashish' });
        done();
      });
    });

    it('should not create table array if it already exists before inserting', (done) => {
      memory.set('name', 'ashish');
      connection.database[Memory.TABLE] = [];
      memory.INSERT().then((id) => {
        connection.database.should.have.property(Memory.TABLE);
        connection.database[Memory.TABLE].length.should.be.eql(1);
        id.should.be.eql('random-uuid-v1');
        connection.database[Memory.TABLE][0].should.be.deep.eql({ id: 'random-uuid-v1', name: 'ashish' });
        done();
      });
    });

    it('should reject with exception when supplied with empty object', (done) => {
      memory.INSERT().should.be.rejectedWith(Error, 'invalid request (empty values)').notify(done);
    });
  });

  describe('UPDATE', () => {
    let memory;
    let connection;

    beforeEach(() => {
      memory = new Memory({});
      Memory.TABLE = 'table';
      connection = new Connection();
      Memory.CONN = connection;
      connection.database.table = [
        {
          id: 'aaa1',
          name: 'a1',
          age: 10,
        },
        {
          id: 'aaa2',
          name: 'a2',
          age: 18,
        },
        {
          id: 'aaa3',
          name: 'a3',
          age: 27,
        },
      ];
    });

    it('should respond success', (done) => {
      const original = new Memory(connection.database.table[0]);
      memory = new Memory({ name: 'ashish' });
      memory.setOriginal(original);
      const expectation = {
        id: 'aaa1',
        name: 'ashish',
        age: 10,
      };
      memory.UPDATE().then((changes) => {
        changes.should.be.equal(1);
        connection.database.should.have.property(Memory.TABLE);
        connection.database[Memory.TABLE].length.should.be.eql(3);
        connection.database[Memory.TABLE][0].should.be.deep.eql(expectation);
        done();
      });
    });

    it('should not find the record so no changes to be made', (done) => {
      Memory.TABLE = 'table2';
      const original = new Memory(connection.database.table[0]);
      memory = new Memory({ name: 'ashish' });
      memory.setOriginal(original);
      memory.UPDATE().should.eventually.equal(0).notify(done);
    });

    it('should throw exception (no condition)', (done) => {
      memory = new Memory(connection.database.table[0]);
      memory.UPDATE().should.be.rejectedWith(Error, 'bad conditions').notify(done);
    });

    it('should throw exception (no changes)', (done) => {
      const original = new Memory(connection.database.table[0]);
      memory = new Memory(connection.database.table[0]);
      memory.setOriginal(original);
      memory.UPDATE().should.be.rejectedWith(Error, 'invalid request (no changes)').notify(done);
    });
  });

  describe('DELETE', () => {
    let memory;
    let connection;

    beforeEach(() => {
      memory = new Memory({});
      Memory.TABLE = 'table';
      connection = new Connection();
      Memory.CONN = connection;
      connection.database.table = [
        {
          id: 'aaa1',
          name: 'a1',
          age: 10,
        },
        {
          id: 'aaa2',
          name: 'a2',
          age: 18,
        },
        {
          id: 'aaa3',
          name: 'a3',
          age: 27,
        },
      ];
    });

    it('should respond success', (done) => {
      memory.set('id', 'aaa3');
      memory.DELETE().then((affected) => {
        affected.should.be.eql(true);
        connection.database.table.length.should.be.eql(2);
        done();
      });
    });

    it('should not find the record to delete, no changes', (done) => {
      memory.set('id', 'aaa4');
      memory.DELETE().should.eventually.equal(false).notify(done);
    });

    it('delete throws exception (no condition)', (done) => {
      memory.DELETE().should.be.rejectedWith(Error, 'invalid request (no condition)').notify(done);
    });
  });

  describe('SELECT', () => {
    let memory;
    let connection;

    beforeEach(() => {
      memory = new Memory({});
      Memory.TABLE = 'table';
      connection = new Connection();
      Memory.CONN = connection;
      connection.database.table = [
        {
          id: 'aaa1',
          name: 'a1',
          age: 10,
        },
        {
          id: 'aaa2',
          name: 'a2',
          age: 18,
        },
        {
          id: 'aaa3',
          name: 'a3',
          age: 27,
        },
      ];
    });

    it('should select all rows of table', (done) => {
      const objects = [
        { id: 'aaa1', name: 'a1', age: 10 },
        { id: 'aaa2', name: 'a2', age: 18 },
        { id: 'aaa3', name: 'a3', age: 27 },
      ];
      const expectation = [
        new Memory(objects[0]),
        new Memory(objects[1]),
        new Memory(objects[2]),
      ];
      expectation[0].setOriginal(new Memory(objects[0]));
      expectation[1].setOriginal(new Memory(objects[1]));
      expectation[2].setOriginal(new Memory(objects[2]));
      memory.SELECT().should.eventually.deep.equal(expectation).notify(done);
    });

    it('should select all where it matches condition (one record)', (done) => {
      const condition = {
        id: 'aaa1',
      };
      const objects = [
        { id: 'aaa1', name: 'a1', age: 10 },
      ];
      const expectation = [
        new Memory(objects[0]),
      ];
      expectation[0].setOriginal(new Memory(objects[0]));
      memory.SELECT(condition).should.eventually.deep.equal(expectation).notify(done);
    });

    it('should select all where it matches condition (multiple records)', (done) => {
      const condition = [{
        field: 'age',
        operator: '>=',
        value: 15,
        condition: 'AND',
      }];
      const objects = [
        { id: 'aaa2', name: 'a2', age: 18 },
        { id: 'aaa3', name: 'a3', age: 27 },
      ];
      const expectation = [
        new Memory(objects[0]),
        new Memory(objects[1]),
      ];
      expectation[0].setOriginal(new Memory(objects[0]));
      expectation[1].setOriginal(new Memory(objects[1]));
      memory.SELECT(condition).should.eventually.deep.equal(expectation).notify(done);
    });

    it('should not return anything if nothing matches condition', (done) => {
      const condition = {
        age: 30,
      };
      const expectation = [];
      memory.SELECT(condition).should.eventually.deep.equal(expectation).notify(done);
    });

    it('should not return anything if table is not defined', (done) => {
      const expectation = [];
      memory.constructor.TABLE = 'table2';
      memory.SELECT().should.eventually.deep.equal(expectation).notify(done);
    });

    it('should return copy of the object, not original', (done) => {
      const condition = {
        age: 18,
      };
      memory.SELECT(condition).then((res) => {
        res[0].properties.should.be.deep.eql(connection.database.table[1]);
        delete res[0].properties.name;
        res[0].properties.should.not.be.deep.eql(connection.database.table[1]);
        done();
      });
    });
  });

  describe('matchObjectConditions', () => {
    let memory;
    let object;

    beforeEach(() => {
      memory = new Memory({});
      object = {
        name: 'ashish',
        age: '20',
        hobby: 'tv',
        city: 'sydney',
        occupation: 'webdesign',
      };
    });

    it('should return true if no condition is provided', () => {
      memory.matchObjectConditions([], object).should.be.eql(true);
    });

    it('should return true if all conditions are true (and)', () => {
      const conditions = [
        {
          field: 'name', value: 'ashish', operator: '=', condition: 'and',
        },
        {
          field: 'hobby', value: 'tv', operator: '=', condition: 'and',
        },
      ];
      memory.matchObjectConditions(conditions, object).should.be.eql(true);
    });

    it('should return false if one or more conditions are false (and)', () => {
      const conditions = [
        {
          field: 'name', value: 'ashish', operator: '=', condition: 'and',
        },
        {
          field: 'hobby', value: 'cricket', operator: '=', condition: 'and',
        },
      ];
      memory.matchObjectConditions(conditions, object).should.be.eql(false);
    });

    it('should return true if at least one condition is true (or)', () => {
      const conditions = [
        {
          field: 'name', value: 'ashish', operator: '=', condition: 'or',
        },
        {
          field: 'hobby', value: 'cricket', operator: '=', condition: 'or',
        },
      ];
      memory.matchObjectConditions(conditions, object).should.be.eql(true);
    });

    it('should return false if all conditions are false (or)', () => {
      const conditions = [
        {
          field: 'name', value: 'joi', operator: '=', condition: 'or',
        },
        {
          field: 'hobby', value: 'cricket', operator: '=', condition: 'or',
        },
      ];
      memory.matchObjectConditions(conditions, object).should.be.eql(false);
    });
  });

  describe('indexOfFn', () => {
    let memory;
    let
      list;

    beforeEach(() => {
      memory = new Memory({});
      list = [
        {
          id: 'aaa1',
          a: 'a1',
          b: 'b1',
          d: 'd',
        },
        {
          id: 'aaa2',
          a: 'a2',
          b: 'b2',
          d: 'd',
        },
        {
          id: 'aaa3',
          a: 'a3',
          b: 'c3',
          d: 'dd',
        },
      ];
    });

    it('should return -1 for object not found', () => {
      memory.indexOfFn(list, new Memory({ id: 'abcd' })).should.be.eql(-1);
    });

    it('should return index of searched object', () => {
      memory.indexOfFn(list, new Memory({ id: 'aaa2' })).should.be.eql(1);
    });
  });

  describe('fixConditionList', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should parse array based conditions correctly', () => {
      const arg = [
        { field: 'a', value: 'aa' },
        { field: 'b', value: 'bb', operator: '>' },
        { field: 'c', value: 'cc', condition: 'OR' },
      ];
      const expectation = [
        {
          field: 'a', value: 'aa', operator: '=', condition: 'and',
        },
        {
          field: 'b', value: 'bb', operator: '>', condition: 'and',
        },
        {
          field: 'c', value: 'cc', operator: '=', condition: 'or',
        },
      ];
      memory.fixConditionList(arg).should.be.deep.eql(expectation);
    });

    it('should parse object based conditions correctly', () => {
      const arg = { a: 'aa', b: 'bb', c: 'cc' };
      const expectation = [
        {
          field: 'a', value: 'aa', operator: '=', condition: 'and',
        },
        {
          field: 'b', value: 'bb', operator: '=', condition: 'and',
        },
        {
          field: 'c', value: 'cc', operator: '=', condition: 'and',
        },
      ];
      memory.fixConditionList(arg).should.be.deep.eql(expectation);
    });
  });

  describe('processCondition', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if criteria matches object property', () => {
      const object = {
        name: 'ashish',
      };
      const condition = {
        field: 'name', value: 'ashish', operator: '=', condition: 'and',
      };
      memory.processCondition(condition, object).should.be.eql(true);
    });

    it('should return false if criteria doesn\'t match object property', () => {
      const object = {
        name: 'devashish',
      };
      const condition = {
        field: 'name', value: 'ashish', operator: '=', condition: 'and',
      };
      memory.processCondition(condition, object).should.be.eql(false);
    });
  });

  describe('=', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 10;
      const b = 10;
      memory['='](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 10;
      const b = 20;
      memory['='](a, b).should.be.eql(false);
    });
  });

  describe('!=', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = '10';
      const b = 10;
      memory['!='](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 10;
      const b = 10;
      memory['!='](a, b).should.be.eql(false);
    });
  });

  describe('>', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 10;
      const b = 5;
      memory['>'](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 10;
      const b = 20;
      memory['>'](a, b).should.be.eql(false);
    });
  });

  describe('<', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 10;
      const b = 20;
      memory['<'](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 10;
      const b = 5;
      memory['<'](a, b).should.be.eql(false);
    });
  });

  describe('>=', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 10;
      const b = 10;
      memory['>='](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 10;
      const b = 20;
      memory['>='](a, b).should.be.eql(false);
    });
  });

  describe('<=', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 10;
      const b = 10;
      memory['<='](a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 15;
      const b = 5;
      memory['<='](a, b).should.be.eql(false);
    });
  });

  describe('in', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 'a';
      const b = ['a', 'b'];
      memory.in(a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 'a';
      const b = ['b', 'c'];
      memory.in(a, b).should.be.eql(false);
    });
  });

  describe('between', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = 5;
      const b = [0, 10];
      memory.between(a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = 15;
      const b = [0, 10];
      memory.between(a, b).should.be.eql(false);
    });
  });

  describe('and', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = true;
      const b = true;
      memory.and(a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = true;
      const b = false;
      memory.and(a, b).should.be.eql(false);
    });
  });

  describe('or', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = true;
      const b = false;
      memory.or(a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = false;
      const b = false;
      memory.or(a, b).should.be.eql(false);
    });
  });

  describe('regexp', () => {
    let memory;

    beforeEach(() => {
      memory = new Memory({});
    });

    it('should return true if condition matches', () => {
      const a = '1,2,4,5,6';
      const b = '(^|,)4(,|$)';
      memory.regexp(a, b).should.be.eql(true);
    });

    it('should return true if condition doesn\'t match', () => {
      const a = '1,2,3,5,6';
      const b = '(^|,)4(,|$)';
      memory.regexp(a, b).should.be.eql(false);
    });
  });
});
