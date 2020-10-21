class WebSockets {
  constructor(ioServer) {
    this.ioServer = ioServer;
    this.users = [];
  }

  connection(client) {
    console.log('Client side socket connection testing');
    // add user-identity of user mapped to the socket id
    client.on('user-identity', (userId) => {
      this.users.push({
        socketId: client.id,
        userId: userId,
      });
    });
    // add new person to chat room
    client.on('subscribe', (room, newUserId = '') => {
      this.addNewUser(room, newUserId);
      client.join(room);
    });
    // mute a chat room
    client.on('unsubscribe', (room) => {
      client.leave(room);
    });
    // disconnect event removes user based on his socketId from users
    client.on('disconnect', () => {
      this.users = this.users.filter((user) => user.socketId !== client.id);
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
