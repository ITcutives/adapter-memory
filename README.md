# @itcutives/adapter-memory

[![Build Status](https://travis-ci.org/ITcutives/adapter-memory.svg?branch=develop)](https://travis-ci.org/ITcutives/adapter-memory)

This repo contains memory adapter for ITcutives Serverless Framework

## Usage

### Install

```bash
npm install @itcutives/adapter-memory
```

### Connection

**connection-provider.js**

```javascript
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
```

### Model

**user.js**

```javascript
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
```

### CRUD

```javascript
/* eslint-disable no-console */
const User = require('./user');

async function init() {
  let records;
  let found;
  let changes;

  await User.CONNECT();

  const user = new User({ type: 'ADMIN', name: 'itcutives', attributes: { phone: '1234-5678' } });
  const insertId = await user.INSERT();

  console.log(`Inserted record with id ${insertId}.`);

  const conditions = [{
    field: 'id',
    operator: '=',
    value: insertId,
    condition: 'AND',
  }];
  records = await user.SELECT(conditions);

  [found] = records;
  console.log(`Found record with name '${found.get('name')}'.`);

  found.set('name', 'new name');
  changes = await found.UPDATE();
  console.log(`Updated ${changes} records.`);

  records = await user.SELECT();
  [found] = records;
  console.log(`Found record with name '${found.get('name')}'.`);

  changes = await found.DELETE();
  console.log(`Deleted ${changes} records.`);

  records = await user.SELECT();
  console.log(`Found ${records.length} records.`);
}

init();
```

## Roadmap

- Save and load data from file system
- CSV vs JSON file support
