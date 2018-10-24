const Adapter = require('../src/adapter');
const Connect = require('../src/connection');

class Memory extends Adapter {
  static CONNECT(config) {
    if (!Memory.CONN) {
      Memory.CONN = new Connect(config);
    }
    return Promise.resolve(Memory.CONN);
  }
}

module.exports = Memory;
