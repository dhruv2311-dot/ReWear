import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const nextSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = nextSocket;
    setSocket(nextSocket);

    nextSocket.on('connect', () => setConnected(true));
    nextSocket.on('disconnect', () => setConnected(false));

    return () => {
      nextSocket.disconnect();
    };
  }, [token]);

  const joinRoom = (swapId) => socketRef.current?.emit('room:join', swapId);
  const leaveRoom = (swapId) => socketRef.current?.emit('room:leave', swapId);
  const sendMessage = (swapId, content) => socketRef.current?.emit('message:send', { swapId, content });
  const startTyping = (swapId) => socketRef.current?.emit('typing:start', { swapId });
  const stopTyping = (swapId) => socketRef.current?.emit('typing:stop', { swapId });

  const on = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);

  const value = useMemo(() => ({
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    on,
    off,
  }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
