/* eslint-disable class-methods-use-this */
/**
 * Created by ashish on 28/4/17.
 */
class AbstractConnection {
  constructor(config) {
    this.config = config;
  }

  openConnection() {
    throw new Error('Method not implemented');
  }

  closeConnection() {
    throw new Error('Method not implemented');
  }
}

module.exports = AbstractConnection;
