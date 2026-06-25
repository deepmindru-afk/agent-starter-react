'use client';

import { useMemo, useState } from 'react';
import { Menu, Table2 } from 'lucide-react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { Sidebar } from '@/components/app/sidebar';
import { RightSidebar } from '@/components/app/right-sidebar';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('username') || '';
    }
    return '';
  });
  const [roomName, setRoomName] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('room') || '';
    }
    return '';
  });

  const fallbackUser = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('user') ?? `va_user_${Math.floor(Math.random() * 10_000)}`
    : `va_user_${Math.floor(Math.random() * 10_000)}`;

  const participantIdentity = username || fallbackUser;
  const participantName = username || fallbackUser;
  const finalRoomName = roomName || `va_room_${Math.floor(Math.random() * 10_000)}`;

  const tokenSource = useMemo(() => {
    const sandboxEndpoint = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT;
    const url = sandboxEndpoint ?? '/api/token';
    const sandboxId = appConfig.sandboxId;
    const roomConfig = appConfig.agentName
      ? { agents: [{ agent_name: appConfig.agentName }] }
      : undefined;

    return TokenSource.custom(async () => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sandboxEndpoint && sandboxId) {
        headers['X-Sandbox-Id'] = sandboxId;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          room_name: finalRoomName,
          participant_identity: participantIdentity,
          participant_name: participantName,
          room_config: roomConfig,
          participant_metadata: JSON.stringify({ role: 'user', department: 'engineering' }),
          participant_attributes: { region: 'us-east', language: 'en', timezone: 'UTC' },
        }),
      });
      return await res.json();
    });
  }, [appConfig, finalRoomName, participantIdentity, participantName]);

  const session = useSession(tokenSource);
  const isConnected = session.isConnected;

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController
          appConfig={appConfig}
          username={username}
          onUsernameChange={setUsername}
          roomName={roomName}
          onRoomNameChange={setRoomName}
        />
      </main>
      <StartAudioButton label="Start Audio" />

      {isConnected && (
        <>
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-3 top-3 z-50 rounded-md p-2 transition-colors hover:bg-accent md:left-6 md:top-6"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-3 top-3 z-50 rounded-md p-2 transition-colors hover:bg-accent md:right-6 md:top-6"
            aria-label="Open right sidebar"
          >
            <Table2 className="size-5" />
          </button>
        </>
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <RightSidebar open={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)} />

      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </AgentSessionProvider>
  );
}
