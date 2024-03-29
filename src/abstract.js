/* eslint-disable no-unused-vars,class-methods-use-this */
/**
 * Created by ashish on 27/4/17.
 */
const Boom = require('@hapi/boom');
const loGet = require('lodash/get');
const loSet = require('lodash/set');
const loUnset = require('lodash/unset');

class AbstractAdapter {
  constructor(entity, context) {
    this.properties = {};
    // set db name to blank
    this.setDatabase('');
    this.setContext(context);

    // if entity object is provided
    if (entity) {
      this.constructor.FIELDS.forEach((field) => {
        const value = loGet(entity, field);
        if (value !== undefined) {
          this.set(field, value);
        }
      });
    }
  }

  /**
   *
   * @return {number}
   * @constructor
   */
  static get PAGESIZE() {
    return 100;
  }

  /**
   *
   * @param sql
   * @param args
   */
  static debug(sql, args) {
    if (process.env.debug === 'true') {
      // eslint-disable-next-line no-console
      console.log(sql, args);
    }
  }

  /**
   * @return {*}
   */
  static get CONN() {
    return AbstractAdapter.connection;
  }

  /**
   * @param conn
   */
  static set CONN(conn) {
    AbstractAdapter.connection = conn;
  }

  /**
   * @param context
   */
  setContext(context) {
    this.context = context;
  }

  /**
   * @returns {*}
   */
  getContext() {
    return this.context;
  }

  /**
   * @return {string}
   */
  getDatabase() {
    return this.database;
  }

  /**
   * @return {string}
   */
  setDatabase(db) {
    this.database = db;
  }

  setOriginal(entity) {
    if (this.constructor === entity.constructor) {
      this.original = entity;
    }
    return this;
  }

  getChanges() {
    const changes = {};
    this.constructor.FIELDS.forEach((field) => {
      const currentValue = this.get(field);
      if (currentValue !== undefined && this.original && currentValue !== this.original.get(field)) {
        loSet(changes, field, currentValue);
      }
    });
    return changes;
  }

  set(key, value) {
    if (!this.properties) {
      this.properties = {};
    }
    if (this.constructor.FIELDS.indexOf(key) !== -1) {
      loSet(this.properties, key, value);
    }
  }

  get(key) {
    if (!this.properties) {
      return undefined;
    }
    return loGet(this.properties, key, undefined);
  }

  remove(key) {
    if (!this.properties) {
      return false;
    }
    return loUnset(this.properties, key);
  }

  async toLink(fields, ModelPath) {
    return this.properties;
  }

  static async fromLink(Cls, object) {
    return new Cls(object);
  }

  /**
   *
   * @param table
   * @param condition
   * @param select
   * @param order
   * @param from
   * @param limit
   */
  query(table, condition, select, order, from, limit) {
    throw Boom.badImplementation('[adapter] `query` method not implemented');
  }

  /**
   *
   * @return {string}
   */
  getTableName() {
    throw Boom.badImplementation('[adapter] `getTableName` method not implemented');
  }

  /**
   * @param condition
   * @param select
   * @param order
   * @param from
   * @param limit
   * @return {*|promise}
   */
  SELECT(condition, select, order, from, limit) {
    throw Boom.badImplementation('[adapter] `SELECT` method not implemented');
  }

  /**
   * @param condition
   * @constructor
   */
  COUNT(condition) {
    throw Boom.badImplementation('[adapter] `COUNT` method not implemented');
  }

  /**
   * @return {*|promise}
   */
  INSERT() {
    throw Boom.badImplementation('[adapter] `INSERT` method not implemented');
  }

  /**
   * @return {*|promise}
   */
  UPDATE() {
    throw Boom.badImplementation('[adapter] `UPDATE` method not implemented');
  }

  /**
   * @return {*|promise}
   */
  DELETE() {
    throw Boom.badImplementation('[adapter] `DELETE` method not implemented');
  }

  /**
   *
   * @param entity
   * @param conditions
   * @param fields
   * @returns {Promise.<TResult>}
   * @constructor
   */
  FINDLINKS(entity, conditions, fields) {
    throw Boom.badImplementation('[adapter] `FINDLINKS` method not implemented');
  }

  /**
   *
   * @param entity
   * @param conditions
   * @returns {Promise.<TResult>}
   * @constructor
   */
  DELETELINK(entity, conditions) {
    throw Boom.badImplementation('[adapter] `DELETELINK` method not implemented');
  }

  /**
   *
   * @param entity
   * @param record
   * @returns {Promise.<TResult>}
   * @constructor
   */
  SAVELINK(entity, record) {
    throw Boom.badImplementation('[adapter] `SAVELINK` method not implemented');
  }
}

module.exports = AbstractAdapter;
