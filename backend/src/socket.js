"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow all origins for simplicity, matching express CORS
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        console.warn('Socket.io not initialized yet!');
        return null;
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map