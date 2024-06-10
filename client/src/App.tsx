import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';

import { useTasks } from './hooks/useTasks';

axios.defaults.baseURL = 'http://localhost:3000/api/v1'

export default function App() {


    const { error, isLoading, tasks } = useTasks();

    if (isLoading) {
        return <CircularProgress />
    }

    return (
        error ? (
            <span>{error}</span>
        ) : (
            <TableContainer component={Paper} style={{ maxHeight: 600 }} className='m-3' >
                <Table stickyHeader>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Operation</TableCell>
                        <TableCell>Left</TableCell>
                        <TableCell>Right</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Response</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {tasks.map((task, index) => (
                        <TableRow
                            key={task.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {task.id}
                            </TableCell>
                            <TableCell>{task.operation}</TableCell>
                            <TableCell>{task.left}</TableCell>
                            <TableCell>{task.right}</TableCell>
                            <TableCell>{task.result}</TableCell>
                            <TableCell>{task.response}</TableCell>
                            <TableCell>{task.timestamp}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    )
}