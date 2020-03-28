/* eslint-disable no-param-reassign,no-unused-vars,class-methods-use-this */
/**
 * Created by ashish on 02/05/18.
 */
const Boom = require('boom');
const UuidV1 = require('uuid/v1');
const loForEach = require('lodash/forEach');
const loIsEmpty = require('lodash/isEmpty');
const loClone = require('lodash/clone');
const loExtend = require('lodash/extend');
const loAssign = require('lodash/assign');
const AbstractAdapter = require('./abstract');

class Adapter extends AbstractAdapter {
  /**
   * @return {{}}
   */
  static get SERIALIZED() {
    return {};
  }

  /**
   * @return {string}
   */
  static get PLURAL() {
    return '';
  }

  /**
   * @return {string}
   */
  static get TABLE() {
    return '';
  }

  /**
   * @return {Array}
   */
  static get FIELDS() {
    return [];
  }

  /**
   * @return {Array}
   */
  static get LINKS() {
    return [];
  }

  constructor(entity, context) {
    super();
    // set db name to blank
    this.setDatabase('');
    this.setContext(context);

    // if entity object is provided
    if (entity) {
      loForEach(entity, (v, field) => {
        if (this.constructor.FIELDS.indexOf(field) !== -1) {
          this.properties[field] = v;
        }
      });
    }
  }

  async serialise() {
    return this;
  }

  async deserialise() {
    return this;
  }

  /**
   *
   * @returns {string}
   */
  getTableName() {
    return this.constructor.TABLE;
  }

  async query(table, condition, select, order, from, limit) {
    const database = await Adapter.CONN.openConnection(this.getDatabase());
    if (!database[table]) {
      return Promise.resolve([]);
    }

    condition = this.fixConditionList(condition);
    const result = database[table].filter((item) => {
      const res = true;
      if (loIsEmpty(condition)) {
        return res;
      }
      return this.matchObjectConditions(condition, item);
    });

    return result.map(r => loClone(r));
  }

  /**
   *
   * @param condition
   * @param select
   * @param order
   * @param from
   * @param limit
   * @return {*|promise}
   */
  async SELECT(condition, select, order, from, limit) {
    const table = this.getTableName();
    limit = limit || this.constructor.PAGESIZE;
    const result = await this.query(table, condition, select, order, from, limit);
    const Cls = this.constructor;
    const deserialised = await Promise.all(result.map(v => new Cls(v)).map(v => v.deserialise()));
    return deserialised.map((v) => {
      v.setOriginal(new Cls(loClone(v.properties)));
      return v;
    });
  }

  /**
   * @return {*|promise}
   */
  async INSERT() {
    if (loIsEmpty(this.properties)) {
      throw new Error('invalid request (empty values)');
    }

    await this.serialise();
    const database = await Adapter.CONN.openConnection(this.getDatabase());
    const table = this.getTableName();

    if (!database[table]) {
      database[table] = [];
    }
    this.properties.id = UuidV1();
    database[table].push(this.properties);
    return Promise.resolve(this.properties.id);
  }

  /**
   * @return {*|promise}
   */
  async UPDATE() {
    if (loIsEmpty(this.original) || !this.original.get('id')) {
      throw Boom.badRequest('bad conditions');
    }

    await this.serialise();

    const condition = {
      id: this.original.get('id'),
    };
    const changes = this.getChanges();

    if (loIsEmpty(changes)) {
      throw new Error('invalid request (no changes)');
    }

    const database = await Adapter.CONN.openConnection(this.getDatabase());
    const table = this.getTableName();

    const result = await this.SELECT(condition);
    let change = 0;

    result.forEach((res) => {
      const index = this.indexOfFn(database[table], res);
      res = loAssign(res.properties, changes);
      database[table][index] = res;
      change += 1;
    });
    return change;
  }

  /**
   * @return {*|promise}
   */
  async DELETE() {
    if (!this.get('id')) {
      throw new Error('invalid request (no condition)');
    }

    const condition = {
      id: this.get('id'),
    };
    const table = this.getTableName();
    const database = await Adapter.CONN.openConnection(this.getDatabase());
    const result = await this.SELECT(condition);

    let affected = 0;
    result.forEach((res) => {
      const index = this.indexOfFn(database[table], res);
      database[table].splice(index, 1);
      affected += 1;
    });
    return Promise.resolve(affected > 0);
  }

  indexOfFn(list, obj) {
    let index = -1;
    list.forEach((o, i) => {
      if (o.id === obj.get('id')) {
        index = i;
      }
    });
    return index;
  }

  matchObjectConditions(conditions, object) {
    let result = null;
    if (conditions.length <= 0) {
      return true;
    }
    conditions.forEach((cond) => {
      const res = this.processCondition(cond, object);
      if (result === null) {
        result = res;
      } else {
        result = this[cond.condition](res, result);
      }
    });
    return result;
  }

  fixConditionList(conditions = []) {
    const sampleCondition = {
      field: '',
      operator: '=',
      value: '',
      condition: 'AND',
    };
    const newConditions = [];
    loForEach(conditions, (cond, key) => {
      let temp;
      // for key-value pairs
      if (typeof cond !== 'object' || cond === null) {
        temp = cond;
        cond = loClone(sampleCondition);
        cond.field = key;
        cond.value = temp;
      }
      cond = loExtend(loClone(sampleCondition), cond);
      cond.condition = cond.condition.toLowerCase();
      newConditions.push(cond);
    });
    return newConditions;
  }

  processCondition(condition, object) {
    const fieldValue = object[condition.field];
    return this[condition.operator](fieldValue, condition.value);
  }

  '='(a, b) {
    return a === b;
  }

  '!='(a, b) {
    return a !== b;
  }

  '>'(a, b) {
    return a > b;
  }

  '<'(a, b) {
    return a < b;
  }

  '>='(a, b) {
    return a >= b;
  }

  '<='(a, b) {
    return a <= b;
  }

  in(a, b) {
    return b.indexOf(a) !== -1;
  }

  between(a, b) {
    return this.and(a > b[0], a < b[1]);
  }

  and(a, b) {
    return a && b;
  }

  or(a, b) {
    return a || b;
  }

  regexp(a, b) {
    const r = new RegExp(b);
    return r.test(a);
  }
}

module.exports = Adapter;
