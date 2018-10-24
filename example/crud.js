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
