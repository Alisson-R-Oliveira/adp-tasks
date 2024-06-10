import WebSocket, { EventEmitter, Server } from 'ws';
import { Server as HTTPServer } from 'http';

let wsConnections: WebSocket[] = [];

const onConnection = async (ws: WebSocket) => {
  wsConnections.push(ws);
  ws.on('close', () => {
    wsConnections = wsConnections.filter((conn) => conn !== ws);
  });
};

export default (server: HTTPServer, emitter: EventEmitter) => {
  const wss = new Server({
    server,
  });

  wss.on('connection', onConnection);
  emitter.on('task_created', (message) => {
    wsConnections.forEach((ws) => ws.send(message));
  });
};
