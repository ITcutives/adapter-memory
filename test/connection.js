const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const AbstractConnection = require('../src/connection');

chai.use(chaiAsPromised);
chai.should();

describe('AbstractConnection', () => {
  let obj;

  beforeEach(() => {
    obj = new AbstractConnection({ db: 'serverless' });
  });

  it('should have type MEMORY', () => {
    AbstractConnection.TYPE.should.be.eql('MEMORY');
  });

  describe('constructor', () => {
    it('should assign the config variable', () => {
      obj.config.should.be.deep.eql({ db: 'serverless' });
    });
  });

  describe('openConnection', () => {
    it('should always resolve true', (done) => {
      obj.openConnection().should.eventually.eql(true).notify(done);
    });
  });

  describe('closeConnection', () => {
    it('should always resolve true', (done) => {
      obj.closeConnection().should.eventually.eql(true).notify(done);
    });
  });
});
