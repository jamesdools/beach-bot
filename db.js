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

const saveSongToDb = async (user, song) => {
  const db = await low(adapter);

  const record = await db.get(USERS).find({ user }).value();

  if (record) {
    console.log('Updating entrance song');

    await db.get(USERS).find({ user }).assign({ song }).write();
  } else {
    console.log('Adding entrance song');

    await db.get(USERS).push({ user, song, enabled: true }).write();
  }
};

const saveSettingToDb = async (user, newSetting) => {
  const db = await low(adapter);

  const record = await db.get(USERS).find({ user }).value();

  if (record) {
    console.log('Updating setting');

    console.log(record);
    await db.get(USERS).find({ user }).assign({ enabled: newSetting }).write();
  } else {
    console.log('No records for user');
  }
};

const init = async () => {
  const db = await low(adapter);
  db.defaults({ users: [] }).write();
};

init();

module.exports = {
  get: getFromDb,
  saveSong: saveSongToDb,
  saveSetting: saveSettingToDb,
};
