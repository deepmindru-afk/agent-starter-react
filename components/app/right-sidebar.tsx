'use client';

import { useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquareTextIcon,
  XIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';
import { CalendarView } from '@/components/app/sidebar-calendar';
import { DataExplorer } from '@/components/app/data-explorer';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function RightSidebar({ open, onClose }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar' | 'dashboard'>('chat');

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
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeTab === 'chat'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <MessageSquareTextIcon className="size-3.5" />
                Samples
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeTab === 'calendar'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <CalendarDays className="size-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeTab === 'dashboard'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </button>
              <button
                onClick={onClose}
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1.5 transition-colors"
              >
                <XIcon className="size-4" />
              </button>
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
