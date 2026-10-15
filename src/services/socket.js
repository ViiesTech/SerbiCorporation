import { io } from 'socket.io-client';
import { SOCKET_URL } from '../redux/constant';

let socket = null;

/**
 * Connect to Socket.IO server with JWT token and join user room
 * @param {string} userAuthToken - JWT token of the logged in user
 * @param {string} currentUserId - MongoDB _id of current user
 * @returns {Socket}
 */
export const connectSocket = (userAuthToken, currentUserId) => {
  if (socket && socket.connected) {
    if (currentUserId) {
      socket.emit('join', currentUserId);
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      token: userAuthToken?.startsWith('Bearer ')
        ? userAuthToken
        : `Bearer ${userAuthToken}`,
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket Connected! ID:', socket.id);
    if (currentUserId) {
      socket.emit('join', currentUserId);
    }
  });

  socket.on('disconnect', reason => {
    console.log('Socket Disconnected:', reason);
  });

  socket.on('connect_error', error => {
    console.log('Socket Connect Error:', error?.message || error);
  });

  return socket;
};

/**
 * Get current active socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Emit typing indicator
 * @param {string} receiverId
 */
export const emitTyping = receiverId => {
  if (socket && socket.connected && receiverId) {
    socket.emit('typing', { receiverId });
  }
};

/**
 * Emit stop typing indicator
 * @param {string} receiverId
 */
export const emitStopTyping = receiverId => {
  if (socket && socket.connected && receiverId) {
    socket.emit('stopTyping', { receiverId });
  }
};
