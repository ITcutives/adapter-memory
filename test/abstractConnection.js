const chai = require('chai');
const AbstractConnection = require('../src/abstractConnection');

chai.should();

describe('AbstractConnection', () => {
  let obj;

  beforeEach(() => {
    obj = new AbstractConnection({ db: 'serverless' });
  });

  describe('constructor', () => {
    it('should assign the config variable', () => {
      obj.config.should.be.deep.eql({ db: 'serverless' });
    });
  });

  describe('openConnection', () => {
    it('should throw exception', () => {
      (() => {
        obj.openConnection();
      }).should.throw('[adapter] `openConnection` method not implemented');
    });
  });

  describe('closeConnection', () => {
    it('should throw exception', () => {
      (() => {
        obj.closeConnection();
      }).should.throw('[adapter] `closeConnection` method not implemented');
    });
  });
});
