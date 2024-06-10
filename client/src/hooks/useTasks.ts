import axios, { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { w3cwebsocket } from 'websocket';

interface Task {
    id: string
    operation: string
    left: number
    right: number
    result: number
    response: string
    timestamp: string
    date: string
}

export const useTasks = () => {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function getTasks() {
            try {
                const { data } = await axios.get<Task[]>('/tasks');
                if (data) {
                    const dataWithDate = data.map((task) => ({
                        ...task,
                        timestamp: new Date(task.timestamp).toISOString()
                    })).filter((task) => task.response);
                    setTasks(dataWithDate);
                };
            } catch(error) {
                if (isAxiosError(error)) {
                    setError(error.message);
                } else {
                    setError('Unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        }
        getTasks();
    }, []);

    useEffect(() => {
        const ws = new w3cwebsocket('ws://localhost:3000');
        ws.onerror = console.error;
        ws.onclose = console.info;
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data as string);
            setTasks(current => [data, ...current]);
        };
    }, []);

    return {
        tasks,
        isLoading,
        error,
    }
}