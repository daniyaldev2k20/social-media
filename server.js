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
const { connectedUsers } = require('./utils/socket/ connectedUsers');

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
io.on('connection', (clientSocket) => {
  clientSocket.on('messageToServer', (dataFromClient) => {
    connectedUsers[dataFromClient.userName] = clientSocket;
  });
  console.log(`A user has connected${clientSocket.id}`);
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
