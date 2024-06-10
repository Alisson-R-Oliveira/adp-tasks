/* eslint-disable no-promise-executor-return */
import axios, { isAxiosError } from 'axios';
import { EventEmitter } from 'node:events';
import {
  addition,
  division,
  multiplication,
  remainder,
  subtraction,
} from '../utils';
import { insert, updateResponse } from '../db';

export interface Task {
  id: string
  operation: string
  left: number
  right: number
  result: number
  response?: string
  timestamp?: string
}

type GetOperationFn = (left: number, right: number) => number

const getOperation = (type: string): GetOperationFn => {
  switch (type) {
    case 'addition':
      return addition;
    case 'subtraction':
      return subtraction;
    case 'remainder':
      return remainder;
    case 'multiplication':
      return multiplication;
    case 'division':
      return division;
    default:
      throw new Error('Invalid operation');
  }
};

const getTask = async (): Promise<Task> => {
  try {
    const { data } = await axios.get<Task>('https://interview.adpeai.com/api/v1/get-task');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const handler = async (emitter: EventEmitter): Promise<void> => {
  let task: Task;

  try {
    task = await getTask();
  } catch (error) {
    return handler(emitter);
  }

  try {
    /*
      First we insert retrieved task on database.
      Then we calculate the result and send to server, updating result with the response.
    */
    const operate = getOperation(task.operation);
    const result = operate(task.left, task.right);
    task.result = result;
    const timestamp = await insert(task);
    const { data } = await axios.post<string>('https://interview.adpeai.com/api/v1/submit-task', {
      id: task.id,
      result,
    });
    await updateResponse(task.id, data);
    task.response = data;
    task.timestamp = new Date(timestamp).toISOString();
  } catch (error) {
    /*
      When errors occurs on server, we update the row with a default text for each status.
      On Too Many Requests errors, we wait 30 seconds before continue with requests.
    */
    if (isAxiosError(error)) {
      let message = 'Unknown error';
      switch (error.response?.status) {
        case 400:
          message = 'Incorrect value in result; no ID specified; value is invalid';
          break;
        case 404:
          message = 'Value not found for specified ID';
          break;
        case 429:
          message = 'Too Many Requests';
          await new Promise((resolve) => setTimeout(resolve, 30000));
          break;
        case 503:
          message = 'Error communicating with database';
          break;
        default:
          break;
      }
      task.response = message;
      await updateResponse(task.id, message);
    } else {
      await updateResponse(task.id, 'Unknown error');
    }
  } finally {
    emitter.emit('task_created', JSON.stringify(task));
    handler(emitter);
  }
};

export default handler;
