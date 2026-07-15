const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/usermodel');
require('dotenv').config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(async () => {
  const password = await bcrypt.hash('test1234', 12);

  await User.updateMany(
    {},
    {
      password,
      passwordConfirm: 'test1234',
    },
  );

  console.log('All passwords reset to test1234');
  process.exit();
});
