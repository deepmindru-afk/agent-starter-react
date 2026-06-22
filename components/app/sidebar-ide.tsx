'use client';

import { useCallback, useRef, useState } from 'react';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ListTodoIcon,
  SendHorizonalIcon,
  XIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { nanoid } from 'nanoid';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { cn } from '@/lib/shadcn/utils';

interface TaskItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ChatMessage {
  id: string;
  from: 'user' | 'assistant';
  content: string;
}

interface SidebarIdeProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarIde({ open, onClose }: SidebarIdeProps) {
  const [planOpen, setPlanOpen] = useState(true);
  const [tasks] = useState<TaskItem[]>([
    { id: '1', status: 'completed', title: 'Refactor Button component' },
    { id: '2', status: 'in_progress', title: 'Add form validation' },
    { id: '3', status: 'pending', title: 'Write unit tests' },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'ready' | 'streaming'>('ready');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: nanoid(),
      from: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStatus('streaming');

    const assistantId = nanoid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      from: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    const response =
      "I'll analyze that for you. Let me look into the codebase and find the best approach.";
    const words = response.split(' ');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= words.length) {
        clearInterval(interval);
        setStatus('ready');
        return;
      }
      const word = words[idx];
      idx++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content + (m.content ? ' ' : '') + word }
            : m
        )
      );
    }, 40);
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

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
              'fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l',
              'bg-background text-foreground border-border'
            )}
          >
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-semibold">IDE</span>
              <button
                onClick={onClose}
                className="hover:bg-accent rounded-md p-1.5 transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Plan Section */}
              <div className="border-b p-3">
                <button
                  onClick={() => setPlanOpen(!planOpen)}
                  className="flex w-full items-center gap-2 text-sm font-medium"
                >
                  {planOpen ? (
                    <ChevronDownIcon className="size-4" />
                  ) : (
                    <ChevronRightIcon className="size-4" />
                  )}
                  Implementation Plan
                </button>
                <AnimatePresence>
                  {planOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="bg-muted rounded-lg p-3">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">
                          Adding form validation
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs">
                            <CheckCircle2Icon className="size-3 text-emerald-500" />
                            <span>Search for validation patterns</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs">
                            <div className="size-3 animate-pulse rounded-full bg-amber-400" />
                            <span>Update validateForm function</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs">
                            <div className="size-3 rounded-full border border-muted-foreground/30" />
                            <span className="text-muted-foreground">Add unit tests</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Task Queue */}
              <div className="border-b p-3">
                <div className="space-y-3">
                  {/* Pending */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <ListTodoIcon className="size-3.5" />
                      Pending ({pendingTasks.length})
                    </div>
                    {pendingTasks.length > 0 ? (
                      <div className="space-y-1">
                        {pendingTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs"
                          >
                            <div
                              className={cn(
                                'size-2 shrink-0 rounded-full',
                                task.status === 'in_progress'
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'border border-muted-foreground/30'
                              )}
                            />
                            <span
                              className={cn(
                                task.status === 'in_progress'
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 text-xs text-muted-foreground/50">
                        No pending tasks
                      </div>
                    )}
                  </div>
                  {/* Completed */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CheckCircle2Icon className="size-3.5" />
                      Completed ({completedTasks.length})
                    </div>
                    {completedTasks.length > 0 ? (
                      <div className="space-y-1">
                        {completedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs"
                          >
                            <CheckCircle2Icon className="size-3 text-emerald-500 shrink-0" />
                            <span className="text-muted-foreground line-through">
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 text-xs text-muted-foreground/50">
                        No completed tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <Conversation>
                <ConversationContent className="gap-4 p-3">
                  {messages.map((msg) => (
                    <Message key={msg.id} from={msg.from}>
                      <MessageContent
                        className={
                          msg.from === 'user'
                            ? 'rounded-lg bg-secondary px-3 py-2'
                            : ''
                        }
                      >
                        {msg.from === 'assistant' ? (
                          <MessageResponse>{msg.content}</MessageResponse>
                        ) : (
                          msg.content
                        )}
                      </MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="bg-muted flex items-end gap-2 rounded-lg border p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the code..."
                  rows={1}
                  className="min-h-[28px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                />
                <button
                  onClick={handleSubmit}
                  disabled={status !== 'ready' || !input.trim()}
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
                    status === 'streaming'
                      ? 'bg-muted-foreground/20 text-muted-foreground/50'
                      : input.trim()
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'bg-muted-foreground/10 text-muted-foreground/30'
                  )}
                >
                  <SendHorizonalIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
