'use client';

import { useState } from 'react';
import {
  CalendarDays,
  MessageSquareTextIcon,
  Table2,
  XIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/shadcn/utils';
import { CalendarView } from '@/components/app/sidebar-calendar';

const sampleTableData = [
  { task: 'Implement auth middleware', status: '✅ Done', priority: 'High', assignee: 'Alice' },
  { task: 'Write API documentation', status: '🔄 In Progress', priority: 'Medium', assignee: 'Bob' },
  { task: 'Fix login redirect bug', status: '✅ Done', priority: 'High', assignee: 'Alice' },
  { task: 'Design dashboard layout', status: '⏳ Pending', priority: 'Low', assignee: 'Carol' },
  { task: 'Database migration script', status: '🔄 In Progress', priority: 'High', assignee: 'Bob' },
  { task: 'End-to-end tests', status: '⏳ Pending', priority: 'Medium', assignee: 'Carol' },
];

function SampleTable() {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-sidebar-border/40">
      <div className="bg-sidebar-accent/30 px-3 py-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
        Project Tasks
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-sidebar-border/20 bg-sidebar-accent/20">
              <th className="px-3 py-2 text-left font-semibold text-sidebar-foreground/70">Task</th>
              <th className="px-3 py-2 text-left font-semibold text-sidebar-foreground/70">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-sidebar-foreground/70">Priority</th>
              <th className="px-3 py-2 text-left font-semibold text-sidebar-foreground/70">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {sampleTableData.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-sidebar-border/10 transition-colors',
                  i % 2 === 0 ? 'bg-sidebar-accent/10' : 'bg-transparent',
                  'hover:bg-sidebar-accent/20'
                )}
              >
                <td className="max-w-[140px] truncate px-3 py-2 font-medium text-sidebar-foreground">
                  {row.task}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sidebar-foreground/80">
                  {row.status}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      row.priority === 'High' && 'bg-destructive/15 text-destructive',
                      row.priority === 'Medium' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      row.priority === 'Low' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="px-3 py-2 text-sidebar-foreground/60">{row.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function RightSidebar({ open, onClose }: RightSidebarProps) {
  const [showSampleTable, setShowSampleTable] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar'>('chat');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={cn(
              'fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l md:w-80',
              'bg-sidebar text-sidebar-foreground border-sidebar-border'
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1.5 transition-colors"
                    aria-label="Right sidebar menu"
                  >
                    <Table2 className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6}>
                  <DropdownMenuItem onClick={() => setShowSampleTable((v) => !v)}>
                    <Table2 className="size-4" />
                    {showSampleTable ? 'Hide Sample Table' : 'Show Sample Table'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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

            {activeTab === 'chat' && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                {showSampleTable && <SampleTable />}

                {!showSampleTable && (
                  <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <div className="flex size-12 items-center justify-center rounded-full bg-sidebar-accent/50">
                      <Table2 className="size-5 text-sidebar-foreground/30" />
                    </div>
                    <p className="px-4 text-center text-xs text-sidebar-foreground/40 leading-relaxed">
                      Toggle the Sample Table from the menu to view sample data.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
