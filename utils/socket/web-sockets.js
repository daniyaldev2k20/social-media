class WebSockets {
  constructor(ioServer) {
    this.ioServer = ioServer;
    this.users = [];
  }

  connection(clientSocket) {
    // add identity of user mapped to the socket id
    clientSocket.on('identity', (userId) => {
      this.users.push({
        socketId: clientSocket.id,
        userId: userId,
      });
    });
    // add new person to chat room
    clientSocket.on('subscribe', (room, newUserId = '') => {
      this.addNewUser(room, newUserId);
      clientSocket.join(room);
    });
    // mute a chat room
    clientSocket.on('unsubscribe', (room) => {
      clientSocket.leave(room);
    });
    // disconnect event removes user based on his socketId from users
    clientSocket.on('disconnect', () => {
      this.users = this.users.filter(
        (user) => user.socketId !== clientSocket.id
      );
    });
  }

  addNewUser(room, newUserId) {
    const userSockets = this.users.filter((user) => user.userId === newUserId);
    userSockets.forEach((userInfo) => {
      const socketConn = this.ioServer.sockets.connected(userInfo.socketId);
      if (socketConn) {
        socketConn.join(room);
      }
    });
  }
}

module.exports = WebSockets;
