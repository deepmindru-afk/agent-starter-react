'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  Clock,
  History,
  KeyRound,
  Link,
  MessageSquareTextIcon,
  Search,
  Sparkles,
  XIcon,
} from 'lucide-react';
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

function groupSessions(sessions: Session[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; sessions: Session[] }[] = [];
  const todaySessions: Session[] = [];
  const yesterdaySessions: Session[] = [];
  const olderSessions: Session[] = [];

  for (const s of sessions) {
    const d = new Date(s.updatedAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) todaySessions.push(s);
    else if (d.getTime() === yesterday.getTime()) yesterdaySessions.push(s);
    else olderSessions.push(s);
  }

  if (todaySessions.length > 0) groups.push({ label: 'Today', sessions: todaySessions });
  if (yesterdaySessions.length > 0) groups.push({ label: 'Yesterday', sessions: yesterdaySessions });
  if (olderSessions.length > 0) groups.push({ label: 'Older', sessions: olderSessions });

  return groups;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const room = useRoomContext();
  const { agent } = useAgent();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [search, setSearch] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [showApiEndpoint, setShowApiEndpoint] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchModels = useCallback(async (key: string, endpoint: string) => {
    const baseUrl = endpoint.trim() || 'https://lm.portalos.ru/v1/models';
    if (key.trim()) {
      try {
        const res = await fetch(baseUrl, {
          headers: { Authorization: `Bearer ${key.trim()}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list: Model[] = (data.data ?? []).map((m: { id: string }) => ({
            id: m.id,
            name: m.id,
          }));
          setModels(list);
          if (list.length > 0)
            setSelectedModel((prev) => (prev && list.some((m) => m.id === prev) ? prev : list[0].id));
          return;
        }
      } catch {
        // fall through to server fallback
      }
    }
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const list: Model[] = data.models ?? [];
      setModels(list);
      if (list.length > 0)
        setSelectedModel((prev) => (prev && list.some((m) => m.id === prev) ? prev : list[0].id));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchModels(apiKey, apiEndpoint);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApiKeyChange = useCallback(
    (value: string) => {
      setApiKey(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchModels(value, apiEndpoint), 500);
    },
    [fetchModels, apiEndpoint]
  );

  const handleEndpointChange = useCallback(
    (value: string) => {
      setApiEndpoint(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchModels(apiKey, value), 500);
    },
    [fetchModels, apiKey]
  );

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

  const filteredSessions = useMemo(
    () =>
      search
        ? sessions.filter(
            (s) =>
              s.title.toLowerCase().includes(search.toLowerCase()) ||
              s.preview.toLowerCase().includes(search.toLowerCase())
          )
        : sessions,
    [sessions, search]
  );

  const grouped = useMemo(() => groupSessions(filteredSessions), [filteredSessions]);

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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={cn(
              'fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r md:w-80',
              'bg-sidebar text-sidebar-foreground border-sidebar-border'
            )}
          >
            <div className="relative flex items-center justify-between border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/95 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-accent">
                  <MessageSquareTextIcon className="size-3.5" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Chat History</span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1.5 transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="border-b border-sidebar-border/50 px-4 py-2.5">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase transition-colors hover:text-sidebar-foreground/70"
              >
                <KeyRound className="size-3" />
                API Key
              </button>
              {showApiKey && (
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-md border border-sidebar-border/30 bg-sidebar-accent/20 py-1.5 px-2.5 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-sidebar-ring/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/30 transition-all"
                />
              )}
              <button
                onClick={() => setShowApiEndpoint(!showApiEndpoint)}
                className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase transition-colors hover:text-sidebar-foreground/70"
              >
                <Link className="size-3" />
                API Endpoint
              </button>
              {showApiEndpoint && (
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  placeholder="https://lm.portalos.ru/v1/models"
                  className="mt-1 w-full rounded-md border border-sidebar-border/30 bg-sidebar-accent/20 py-1.5 px-2.5 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-sidebar-ring/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/30 transition-all"
                />
              )}
            </div>

            {models.length > 0 && (
              <div className="border-b border-sidebar-border/50 px-4 py-2.5">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
                  <Brain className="size-3" />
                  Model
                </div>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => {
                    setSelectedModel(value);
                    room?.localParticipant?.setAttributes({ current_model: value });
                  }}
                >
                  <SelectTrigger className="w-full border-sidebar-border/50 bg-sidebar-accent/30 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent/50">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-3 text-sidebar-foreground/40" />
                          {model.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="border-b border-sidebar-border/50 px-4 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-sidebar-foreground/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-md border border-sidebar-border/30 bg-sidebar-accent/20 py-1.5 pr-2.5 pl-8 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-sidebar-ring/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/30 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <div className="size-6 animate-spin rounded-full border-2 border-sidebar-border/40 border-t-sidebar-foreground/70" />
                  <span className="text-[11px] text-sidebar-foreground/40 animate-pulse">
                    Loading conversations...
                  </span>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <div className="flex size-12 items-center justify-center rounded-full bg-sidebar-accent/50">
                    <History className="size-5 text-sidebar-foreground/30" />
                  </div>
                  <p className="px-4 text-center text-xs text-sidebar-foreground/40 leading-relaxed">
                    {search ? 'No conversations match your search.' : 'No conversations yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grouped.map((group) => (
                    <div key={group.label}>
                      <div className="mb-1.5 px-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase">
                        {group.label}
                      </div>
                      <div className="space-y-0.5">
                        {group.sessions.map((session) => (
                          <motion.button
                            key={session.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              'group w-full rounded-lg p-3 text-left transition-all',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              'border border-transparent hover:border-sidebar-border/30'
                            )}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="flex-1 truncate text-sm font-medium">
                                {session.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-sidebar-foreground/25 opacity-0 transition-opacity group-hover:opacity-100">
                                <Clock className="size-3" />
                              </span>
                            </div>
                            <div className="text-sidebar-foreground/45 mb-1.5 line-clamp-2 text-xs leading-relaxed">
                              {session.preview}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-sidebar-foreground/25">
                              <Clock className="size-2.5" />
                              {new Date(session.updatedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year:
                                  new Date(session.updatedAt).getFullYear() ===
                                  new Date().getFullYear()
                                    ? undefined
                                    : 'numeric',
                              })}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
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
