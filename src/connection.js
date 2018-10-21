/* eslint-disable class-methods-use-this */
/**
 * Created by ashish on 28/4/17.
 */
const AbstractConnection = require('./abstractConnection');

class Connection extends AbstractConnection {
  static get TYPE() {
    return 'MEMORY';
  }

  async openConnection() {
    return true;
  }

  closeConnection() {
    return true;
  }
}

module.exports = Connection;
