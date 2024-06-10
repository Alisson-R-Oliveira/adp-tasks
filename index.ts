import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { EventEmitter } from 'node:events';
import path from 'path';
import handler from './src/tasks';
import wsHandler from './src/ws';
import { openDbConnection, queryTasks } from './src/db';

const app = express();

const port = 3000;
const server = http.createServer(app);
const emitter = new EventEmitter();

app.use(cors());

app.get('/api/v1/tasks', async (request: Request, response: Response) => {
  try {
    const tasks = await queryTasks();
    response.status(200).send(tasks);
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

app.use(express.static('client/build'));

app.get('*', (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

server.listen(port, async () => {
  console.info(`Server is running on http://localhost:${port}`);
  await openDbConnection();
  handler(emitter);
  wsHandler(server, emitter);
});

export default app;
