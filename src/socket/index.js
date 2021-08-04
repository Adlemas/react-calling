import { io } from 'socket.io-client';

const options = {
    "force new connecction": true,
    reconnectionAttempts: "Infinity",
    transports: ["websocket"],
    timeout: 10000
}

const socket = io('http://localhost:3001', options)

export default socket;