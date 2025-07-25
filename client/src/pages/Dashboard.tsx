import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { useAuth } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <SocketProvider userId={user?.id}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <TaskBoard />
      </div>
    </SocketProvider>
  );
};

export default Dashboard;