const mongoose = require('mongoose');
const dotenv = require('dotenv');
// eslint-disable-next-line import/order
const app = require('./app');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

//for uncaught exceptions like x is not defined; used for synchronous code in NodeJS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); //1 stands for uncaught exception
});

dotenv.config({ path: './config.env' });
const chatsController = require('./controllers/chats-controller')(io);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB successfully connected');
  });

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//process is an instance of EventEmitter and will handle all unhandled promises in NodeJS
//this is used for asynchronous code; Promises
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1); //1 stands for uncaught exception
  });
});
