'use client';

import { useState } from 'react';
import {
  Send,
  FileText,
  LayoutDashboard,
  MessageSquareTextIcon,
  XIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shadcn/utils';
import { DataExplorer } from '@/components/app/data-explorer';
import { PlateEditor } from '@/components/app/plate-editor';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function RightSidebar({ open, onClose }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'send_data' | 'dashboard' | 'editor'>('chat');
  const [textData, setTextData] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleSendData = async () => {
    if (!textData) return;
    
    try {
      // Assuming an API endpoint exists to send data. 
      // Since I don't have the exact API spec for the frontend, 
      // I'll implement a fetch call to a hypothetical /api/send-data or similar.
      // Or better, check if there's a provided tool or environment variable.
      
      const response = await fetch('/api/send-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textData, 
          room_name: roomName 
        }),
      });

      if (response.ok) {
        alert('Data sent successfully!');
        setTextData('');
      } else {
        alert('Failed to send data.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      alert('An error occurred while sending data.');
    }
  };

  return (
    open && (
      <>
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className={cn(
            'fixed inset-0 z-50 flex h-svh w-full flex-col',
            'bg-sidebar text-sidebar-foreground'
          )}
        >
            <div className="flex items-center gap-1 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/95 px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('chat')}
                className={cn(
                  'gap-1.5 px-2.5 py-1.5 text-xs font-medium',
                  activeTab === 'chat'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <MessageSquareTextIcon className="size-3.5" />
                Примеры
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('send_data')}
                className={cn(
                  'gap-1.5 px-2.5 py-1.5 text-xs font-medium',
                  activeTab === 'send_data'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Send className="size-3.5" />
                Отправить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  'gap-1.5 px-2.5 py-1.5 text-xs font-medium',
                  activeTab === 'dashboard'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <LayoutDashboard className="size-3.5" />
                Панель
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('editor')}
                className={cn(
                  'gap-1.5 px-2.5 py-1.5 text-xs font-medium',
                  activeTab === 'editor'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <FileText className="size-3.5" />
                Редактор
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-md p-1.5"
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            {activeTab === 'send_data' && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Название комнаты</Label>
                    <Input 
                      id="room-name" 
                      placeholder="Введите название комнаты..." 
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-data">Данные</Label>
                    <div className="flex flex-col gap-2">
                      <textarea 
                        id="text-data"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Введите текст для отправки..."
                        value={textData}
                        onChange={(e) => setTextData(e.target.value)}
                      />
                      <Button 
                        onClick={handleSendData} 
                        className="w-full"
                        disabled={!textData}
                      >
                        Отправить данные
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <iframe
                src={process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://portalos.ru'}
                className="flex-1 w-full border-0"
                title="Панель управления"
              />
            )}

            {activeTab === 'editor' && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                <PlateEditor />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                <DataExplorer />
              </div>
            )}
        </motion.aside>
      </>
    )
  );
}
