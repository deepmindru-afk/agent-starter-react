'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, MessageSquareTextIcon, XIcon } from 'lucide-react';
import { useAgent, useRoomContext } from '@livekit/components-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/shadcn/utils';

interface Session {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

interface Model {
  id: string;
  name: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const room = useRoomContext();
  const { agent } = useAgent();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        const list: Model[] = data.models ?? [];
        setModels(list);
        if (list.length > 0) setSelectedModel(list[0].id);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    const participant = room?.localParticipant;
    const agentIdentity = agent?.identity;
    if (!participant || !agentIdentity) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setSessions([]);

    try {
      const response = await participant.performRpc({
        destinationIdentity: agentIdentity,
        method: 'get_sessions',
        payload: JSON.stringify({ limit: 20 }),
        responseTimeout: 10000,
      });
      const data = JSON.parse(response);
      setSessions(data.sessions ?? []);
    } catch {
      // RPC unavailable — keep empty
    } finally {
      setLoading(false);
    }
  }, [room, agent]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r md:w-80',
              'bg-sidebar text-sidebar-foreground border-sidebar-border'
            )}
          >
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquareTextIcon className="size-4" />
                <span className="text-sm font-semibold">Chat History</span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1 transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {models.length > 0 && (
              <div className="border-b border-sidebar-border px-4 py-3">
                <div className="mb-2 text-xs font-semibold text-sidebar-foreground/70">
                  Model
                </div>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => {
                    setSelectedModel(value);
                    room?.localParticipant?.setAttributes({ current_model: value });
                  }}
                >
                  <SelectTrigger className="w-full bg-sidebar text-sidebar-foreground text-sm">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="size-5 animate-spin rounded-full border-2 border-sidebar-border border-t-sidebar-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sidebar-foreground/50 py-16 text-center text-xs">
                  No sessions yet
                </p>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      className={cn(
                        'w-full rounded-lg p-3 text-left transition-colors',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <div className="mb-1 truncate text-sm font-medium">
                        {session.title}
                      </div>
                      <div className="text-sidebar-foreground/50 mb-1.5 line-clamp-2 text-xs">
                        {session.preview}
                      </div>
                      <div className="text-sidebar-foreground/30 flex items-center gap-1 text-[10px]">
                        <Clock className="size-2.5" />
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
