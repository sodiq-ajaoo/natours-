const mongoose = require('mongoose');

const dotenv = require('dotenv');

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successuful');
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(` app running on port ${port}...`);
});

////cytcfhf

// process.on('unhandleRejection', (err) => {
//   console.log(err.name, err.message);
// });

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});

console.log(__dirname);
// console.log(process.env.DATABASE_PASSWORD);

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);

//   server.close(() => {
//     process.exit(1);
//   });
// });
