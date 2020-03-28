const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Connection = require('../src/connection');

chai.use(chaiAsPromised);
chai.should();

describe('Connection', () => {
  let obj;

  beforeEach(() => {
    obj = new Connection({ db: 'serverless' });
  });

  it('should have type MEMORY', () => {
    Connection.TYPE.should.be.eql('MEMORY');
  });

  describe('constructor', () => {
    it('should assign the config variable', () => {
      obj.config.should.be.deep.eql({ db: 'serverless' });
    });
  });

  describe('openConnection', () => {
    it('should always resolve true', (done) => {
      obj.openConnection().should.eventually.deep.eql({}).notify(done);
    });
  });

  describe('closeConnection', () => {
    it('should always resolve true', (done) => {
      obj.closeConnection().should.eventually.eql(true).notify(done);
    });
  });
});
