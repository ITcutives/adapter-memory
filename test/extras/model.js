/**
 * Created by ashish on 17/5/17.
 */
const Adapter = require('../../src/adapter');

class Model extends Adapter {
  /**
   * @return {string}
   */
  static get DATABASE() {
    return Model.database;
  }

  /**
   *
   * @param {string} d
   * @constructor
   */
  static set DATABASE(d) {
    Model.database = d;
  }

  /**
   * @returns {{}}
   */
  static get SERIALIZED() {
    return {
      jsonfield: 'json',
    };
  }

  /**
   * @returns {string}
   */
  static set PLURAL(plural) {
    Model.plural = plural;
  }

  /**
   * @returns {string}
   */
  static get PLURAL() {
    return Model.plural;
  }

  /**
   *
   * @param {string} t
   * @constructor
   */
  static set TABLE(t) {
    Model.table = t;
  }

  /**
   * @returns {string}
   */
  static get TABLE() {
    return Model.table;
  }

  /**
   * @returns {Array}
   */
  static get FIELDS() {
    return ['id', 'name', 'jsonfield', 'age'];
  }

  /**
   *
   * @param {Array} l
   * @constructor
   */
  static set LINKS(l) {
    Model.links = l;
  }

  /**
   * @returns {Array}
   */
  static get LINKS() {
    return Model.links;
  }
}

module.exports = Model;
