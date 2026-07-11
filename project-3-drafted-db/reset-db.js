const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'drafted.db');

for (const ext of ['', '-wal', '-shm']) {
  const file = DB_PATH + ext;
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('Removed', file);
  }
}
console.log('Database reset. It will be recreated and reseeded next time you run `npm start`.');
