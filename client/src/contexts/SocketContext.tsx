import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Task, User, SocketEvents } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: User[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Backend socket URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      auth: {
        userId,
      },
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Join a default room for the workspace
      socketInstance.emit('join', 'workspace-1');
      toast({
        title: 'Connected',
        description: 'Real-time collaboration enabled',
      });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Real-time collaboration disabled',
        variant: 'destructive',
      });
    });

    // Listen for task events from your backend
    socketInstance.on('task:created', (task: Task) => {
      // This will be handled in TaskBoard component
    });

    socketInstance.on('task:updated', (task: Task) => {
      // This will be handled in TaskBoard component
    });

    socketInstance.on('user:joined', (user: User) => {
      setOnlineUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
      toast({
        title: 'User joined',
        description: `${user.name} joined the workspace`,
      });
    });

    socketInstance.on('user:left', (userId: string) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, toast]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};