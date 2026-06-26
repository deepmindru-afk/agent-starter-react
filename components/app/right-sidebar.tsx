'use client';

import { useState } from 'react';
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageSquareTextIcon,
  XIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';
import { CalendarView } from '@/components/app/sidebar-calendar';
import { DataExplorer } from '@/components/app/data-explorer';
import { PlateEditor } from '@/components/app/plate-editor';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function RightSidebar({ open, onClose }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar' | 'dashboard' | 'editor'>('chat');

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
                Samples
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  'gap-1.5 px-2.5 py-1.5 text-xs font-medium',
                  activeTab === 'calendar'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <CalendarDays className="size-3.5" />
                Calendar
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
                Dashboard
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
                Editor
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

            {activeTab === 'calendar' && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                <CalendarView />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <iframe
                src={process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://portalos.ru'}
                className="flex-1 w-full border-0"
                title="Dashboard"
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
