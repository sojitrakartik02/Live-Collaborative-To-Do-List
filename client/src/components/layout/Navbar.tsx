import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { LogOut, Users, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();

  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--gradient-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge variant="secondary" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1 text-completed" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1 text-destructive" />
                  Offline
                </Badge>
              )}
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Online Users Count */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{onlineUsers.length} online</span>
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};