const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketio = require('socket.io');

//for uncaught exceptions like x is not defined; used for synchronous code in NodeJS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); //1 stands for uncaught exception
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const io = socketio(server);

// Listening for incoming sockets on connection event, and saving clientSocket in connectedUsers
io.on('connection', () => {
  console.log('User has connected');
});

// Attaching the socketio instance io to middleware for getting access to io instance in controllers
app.use(function (req, res, next) {
  req.io = io;
  console.log('Testing socketio');
  next();
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
