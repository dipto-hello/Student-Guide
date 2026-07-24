import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function Notifications() {
  const { socket, isConnected } = useSocket();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch initial notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.isRead).length);
        }
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.info('New Notification', {
        description: notification.message,
      });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isConnected]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 max-h-[400px] flex flex-col premium-card rounded-2xl shadow-2xl overflow-hidden bg-background/95 backdrop-blur border border-border"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Bell className="w-4 h-4" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                  Mark all read
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border ${n.isRead ? 'border-transparent bg-transparent' : 'border-indigo-500/20 bg-indigo-500/5'} transition-colors cursor-pointer hover:bg-accent flex items-start justify-between gap-2`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div>
                      <p className={`text-sm ${n.isRead ? 'text-foreground/80' : 'text-foreground font-semibold'}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`h-12 w-12 rounded-full shadow-xl transition-transform hover:scale-105 ${unreadCount > 0 ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-background hover:bg-accent border border-border text-foreground'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
