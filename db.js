require('dotenv').config();

const low = require('lowdb');

const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('db.json');

const USERS = 'users';

const getFromDb = async (user) => {
  const db = await low(adapter);
  const record = await db.get(USERS).find({ user }).value();

  return record;
};

const saveToDb = async (user, song) => {
  const db = await low(adapter);

  const record = await db.get(USERS).find({ user }).value();

  if (record) {
    console.log('Updating record');

    await db.get(USERS).find({ user }).assign({ song }).write();
  } else {
    console.log('Creating new record');

    await db.get(USERS).push({ user, song }).write();
  }
};

const init = async () => {
  const db = await low(adapter);
  db.defaults({ users: [] }).write();
};

init();

module.exports = {
  get: getFromDb,
  save: saveToDb,
};
