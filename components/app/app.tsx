'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
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
  const tokenSource = useMemo(() => {
    return typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string'
      ? getSandboxTokenSource(appConfig)
      : TokenSource.endpoint('/api/connection-details');
  }, [appConfig]);


  const getRoomName = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roomName = searchParams.get('room') || `va_room_${Math.floor(Math.random() * 10_000)}`;
      return roomName;
    }
    return `va_room_${Math.floor(Math.random() * 10_000)}`; // Заглушка для сервера
  };
  
  const getParticipantIdentity = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const participantIdentity = searchParams.get('username') || `va_user_${Math.floor(Math.random() * 10_000)}`;
      return participantIdentity;
    }
    return `va_user_${Math.floor(Math.random() * 10_000)}`; // Заглушка для сервера
  };

  const getParticipantName = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const participantName = searchParams.get('user') || `va_user_${Math.floor(Math.random() * 10_000)}`;
      return participantName;
    }
    return `va_user_${Math.floor(Math.random() * 10_000)}`; // Заглушка для сервера
  };
  
  const roomName = getRoomName();
  const participantIdentity = getParticipantIdentity();
  const participantName = getParticipantName();
  
  //const searchParams = window.location.search.trim();
  //const roomName = searchParams ? 
  //    `${searchParams.substring(1)}` : // Use searchParams without the leading '?'
  //    `va_room_${Math.floor(Math.random() * 10_000)}`; // Generate random roomName if searchParams is empty
  //const searchParams = new URLSearchParams(window.location.search);
  //const room = searchParams.get('room'); // Извлекаем значение второго параметра
  //const roomName = room || `va_room_${Math.floor(Math.random() * 10_000)}`;
  //const participant = searchParams.get('user'); // Извлекаем значение второго параметра
  //const participantName = participant || `va_ppuser_${Math.floor(Math.random() * 10_000)}`;
  //const participantIdentity = participant || `va_ppuser_${Math.floor(Math.random() * 10_000)}`;
  
  //console.log(roomName);
  //console.log(participantIdentity);
  //console.log(participantName);
  
  const session = useSession(
    tokenSource,
    appConfig.agentName ? {
      agentName: appConfig.agentName,
      roomName: roomName,
      participantName: participantName,
      participantIdentity: participantIdentity 
    } : undefined,
  );

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} />
      </main>
      <StartAudioButton label="Start Audio" />
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
