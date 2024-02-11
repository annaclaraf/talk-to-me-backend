import express, { Application } from "express";
import http from "http";
import { Server, Socket} from "socket.io";

export class App {
  private app: Application;
  private http: http.Server;
  private io: Server;

  constructor() {
    this.app = express();
    this.http = new http.Server(this.app);
    this.io = new Server(this.http, { cors: { origin: "*" } });
  }

  public listen() {
    this.http.listen(3333, () =>
      console.log("server is runing on port 3333"),
    );
  }

  public listenSocket() {
    this.io.of('/streams').on('connection', this.socketEvents);
  }

  private socketEvents(socket: Socket) {
    socket.on('subscribe', (data) => {
      socket.join(data.roomId);
      socket.join(data.socketId);

      const roomsSession = Array.from(socket.rooms);

      if (roomsSession.length > 1) {
        socket.to(data.roomId).emit("new user", {
          socketId: socket.id,
          username: data.username,
        });
      }
    });

    socket.on("new user connected", data => {
      socket.to(data.to).emit("new user connected", { 
        sender: data.sender,
        username: data.username,
      });
    });

    socket.on('chat', (data) => {
      socket.broadcast.to(data.roomId).emit('chat', {
        message: data.message,
        username: data.username,
        time: data.time,
      });
    });
  }

}
