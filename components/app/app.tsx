'use client';

import { useMemo, useState } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { Sidebar } from '@/components/app/sidebar';
import { TopBar } from '@/components/app/top-bar';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

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
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('username') || '';
    }
    return '';
  });

  const tokenSource = useMemo(() => {
    return typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string'
      ? getSandboxTokenSource(appConfig)
      : TokenSource.endpoint('/api/token');
  }, [appConfig]);

  const getRoomName = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('room') || `va_room_${Math.floor(Math.random() * 10_000)}`;
    }
    return `va_room_${Math.floor(Math.random() * 10_000)}`;
  };

  const getParticipantIdentity = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('user') || `va_user_${Math.floor(Math.random() * 10_000)}`;
    }
    return `va_user_${Math.floor(Math.random() * 10_000)}`;
  };

  const roomName = getRoomName();
  const participantIdentity = getParticipantIdentity();
  const participantName = username || `va_user_${Math.floor(Math.random() * 10_000)}`;

  const session = useSession(
    tokenSource,
    appConfig.agentName ? {
      agentName: appConfig.agentName,
      roomName: roomName,
      participantName: participantName,
      participantIdentity: participantIdentity,
    } : undefined,
  );

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController
          appConfig={appConfig}
          username={username}
          onUsernameChange={setUsername}
        />
      </main>
      <StartAudioButton label="Start Audio" />

      <TopBar onSidebarOpen={() => setSidebarOpen(true)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
