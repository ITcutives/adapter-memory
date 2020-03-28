/* eslint-disable class-methods-use-this */
/**
 * Created by ashish on 28/4/17.
 */
const AbstractConnection = require('./abstractConnection');

class Connection extends AbstractConnection {
  constructor(config) {
    super(config);
    this.database = {};
  }

  static get TYPE() {
    return 'MEMORY';
  }

  async openConnection(db) {
    const database = db || this.config.db;
    if (this.database[database]) {
      return this.database[database];
    }
    this.database[database] = {};
    return this.database[database];
  }

  async closeConnection() {
    return true;
  }
}

module.exports = Connection;
