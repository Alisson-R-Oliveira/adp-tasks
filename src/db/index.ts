import sqlite from 'sqlite3';
import { open, Database } from 'sqlite';
import { Task } from '../tasks';

export type Connection = Database<sqlite.Database, sqlite.Statement>

const DB_PATH = './tasks.db';

sqlite.verbose();

let connection: Connection;

const createTasksTable = async (): Promise<void> => {
  await connection.exec(`
    CREATE TABLE IF NOT EXISTS tasks
    (
      id text PRIMARY KEY,
      operation text NOT NULL,
      left INTEGER NOT NULL,
      right INTEGER NOT NULL,
      result INTEGER NULL,
      response TEXT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
};

export const openDbConnection = async (): Promise<void> => {
  connection = await open({
    filename: DB_PATH,
    driver: sqlite.Database,
  });
  await createTasksTable();
};

export const insert = async (task: Task): Promise<number> => {
  const date = Date.now();
  await connection.run(
    `INSERT INTO tasks (
      id,
      operation,
      left,
      right,
      result,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    task.id,
    task.operation,
    task.left,
    task.right,
    task.result,
    date,
  );
  return date;
};

export const updateResponse = async (
  taskId: string,
  response: string,
): Promise<void> => {
  await connection.run(`UPDATE tasks
                           SET response = ?
                         WHERE id = ?
  `, response, taskId);
};

export const queryTasks = async (): Promise<Task[]> => connection.all('SELECT * FROM tasks ORDER BY timestamp DESC');
