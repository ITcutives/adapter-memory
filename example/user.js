const Abstract = require('./connection-provider');

class User extends Abstract {
  /**
   * @returns {string}
   */
  static get PLURAL() {
    return 'users';
  }

  /**
   * @returns {string}
   */
  static get TABLE() {
    return 'user';
  }

  /**
   * @returns {Array}
   */
  static get FIELDS() {
    return ['id', 'name', 'type', 'attributes'];
  }
}

module.exports = User;
