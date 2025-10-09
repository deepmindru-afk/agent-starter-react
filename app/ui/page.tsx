import { Track } from 'livekit-client';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { TrackDeviceSelect } from '@/components/livekit/agent-control-bar/track-device-select';
import { TrackSelector } from '@/components/livekit/agent-control-bar/track-selector';
import { TrackToggle } from '@/components/livekit/agent-control-bar/track-toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/livekit/alert';
import { AlertToast } from '@/components/livekit/alert-toast';
import { Button } from '@/components/livekit/button';
import { ChatEntry } from '@/components/livekit/chat-entry';
import { ChatTranscript } from '@/components/livekit/chat-transcript';
import { PreConnectMessage } from '@/components/livekit/preconnect-message';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/livekit/select';
import { ShimmerMessage } from '@/components/livekit/shimmer-message';
import { Toggle } from '@/components/livekit/toggle';
import { Container } from './_container';

const buttonVariants = [
  'default',
  'primary',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
] as const;
const toggleVariants = ['default', 'primary', 'secondary', 'outline'] as const;
const alertVariants = ['default', 'destructive'] as const;

export default function Base() {
  return (
    <>
      {/* Button */}
      <Container>
        <h3 className="text-muted-foreground text-sm">A button component.</h3>
        <div className="space-y-2">
          {buttonVariants.map((variant) => (
            <div key={variant}>
              <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">{variant}</h4>
              <div className="grid w-full grid-cols-4 gap-2">
                <div>
                  <Button variant={variant} size="sm">
                    Size sm
                  </Button>
                </div>
                <div>
                  <Button variant={variant}>Size default</Button>
                </div>
                <div>
                  <Button variant={variant} size="lg">
                    Size lg
                  </Button>
                </div>
                <div>
                  <Button variant={variant} size="icon">
                    <PlusIcon size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Toggle */}
      <Container>
        <h3 className="text-muted-foreground text-sm">A toggle component.</h3>
        <div className="space-y-2">
          {toggleVariants.map((variant) => (
            <div key={variant}>
              <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">{variant}</h4>
              <div className="grid w-full grid-cols-3 gap-2">
                <div>
                  <Toggle key={variant} variant={variant} size="sm">
                    Size sm
                  </Toggle>
                </div>
                <div>
                  <Toggle key={variant} variant={variant}>
                    Size default
                  </Toggle>
                </div>
                <div>
                  <Toggle key={variant} variant={variant} size="lg">
                    Size lg
                  </Toggle>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Alert */}
      <Container>
        <h3 className="text-muted-foreground text-sm">An alert component.</h3>
        <div className="space-y-6">
          {alertVariants.map((variant) => (
            <div key={variant}>
              <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">{variant}</h4>
              <Alert key={variant} variant={variant}>
                <AlertTitle>Alert {variant} title</AlertTitle>
                <AlertDescription>This is a {variant} alert description.</AlertDescription>
              </Alert>
            </div>
          ))}
        </div>
      </Container>

      {/* Select */}
      <Container>
        <h3 className="text-muted-foreground text-sm">A select component.</h3>
        <div className="grid w-full grid-cols-2 gap-2">
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size default</h4>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Track 1</SelectItem>
                <SelectItem value="2">Track 2</SelectItem>
                <SelectItem value="3">Track 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size sm</h3>
            <Select>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Track 1</SelectItem>
                <SelectItem value="2">Track 2</SelectItem>
                <SelectItem value="3">Track 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Container>
      {/* Agent control bar */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A control bar component.</h3>
        </div>
        <div className="relative flex items-center justify-center">
          <AgentControlBar
            className="w-full"
            controls={{
              leave: true,
              chat: true,
              camera: true,
              microphone: true,
              screenShare: true,
            }}
          />
        </div>
      </Container>
      {/* Alert toast */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A alert toast component.</h3>
        </div>
        <div className="space-y-4">
          <AlertToast
            id="alert-toast"
            title="Alert toast"
            description="This is a alert toast description."
          />
        </div>
      </Container>
      {/* Chat entry */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A chat entry component.</h3>
        </div>
        <div className="space-y-4">
          <ChatEntry
            hideName
            entry={
              {
                id: '1',
                timestamp: Date.now(),
                message: 'Hello, how are you?',
                from: {
                  identity: 'user',
                  isLocal: true,
                  name: 'User',
                  audioTrackPublications: new Map(),
                  videoTrackPublications: new Map(),
                  trackPublications: new Map(),
                  audioLevel: 0,
                },
              } as ReceivedChatMessage
            }
          />
          <ChatEntry
            hideName
            entry={
              {
                id: '1',
                timestamp: Date.now(),
                message: 'I am good, how about you?',
                from: {
                  identity: 'agent',
                  isLocal: false,
                  name: 'Agent',
                  audioTrackPublications: new Map(),
                  videoTrackPublications: new Map(),
                  trackPublications: new Map(),
                  audioLevel: 0,
                },
              } as ReceivedChatMessage
            }
          />
        </div>
      </Container>
      {/* Shimmer message */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A shimmer message component.</h3>
        </div>
        <div className="space-y-4 text-center">
          <ShimmerMessage>This is a shimmer message</ShimmerMessage>
        </div>
      </Container>
      {/* Preconnect message */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A preconnect message component.</h3>
        </div>
        <div className="space-y-4">
          <PreConnectMessage />
        </div>
      </Container>
      {/* Theme toggle */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A theme toggle component.</h3>
        </div>
        <div className="flex justify-center space-y-4">
          <div>
            <ThemeToggle />
          </div>
        </div>
      </Container>
      {/* Device select */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A device select component.</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size default</h4>
            <TrackDeviceSelect kind="audioinput" />
          </div>
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size sm</h4>
            <TrackDeviceSelect size="sm" kind="audioinput" />
          </div>
        </div>
      </Container>
      {/* Track toggle */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A track toggle component.</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">
              Track.Source.Microphone
            </h4>
            <TrackToggle variant="outline" source={Track.Source.Microphone} />
          </div>
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">
              Track.Source.Camera
            </h4>
            <TrackToggle variant="outline" source={Track.Source.Camera} />
          </div>
        </div>
      </Container>
      {/* Track selector */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A track selector component.</h3>
        </div>
        <div className="space-y-4">
          <TrackSelector kind="videoinput" source={Track.Source.Camera} />
          <TrackSelector kind="audioinput" source={Track.Source.Microphone} />
        </div>
      </Container>
      {/* Transcript */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A transcript component.</h3>
        </div>
        <div className="relative space-y-4">
          <ChatTranscript
            messages={[
              {
                id: '1',
                timestamp: Date.now(),
                message: 'Hello, how are you?',
                from: {
                  identity: 'user',
                  isLocal: true,
                  name: 'User',
                  audioTrackPublications: new Map(),
                  videoTrackPublications: new Map(),
                  trackPublications: new Map(),
                  audioLevel: 0,
                },
              } as ReceivedChatMessage,
              {
                id: '2',
                timestamp: Date.now(),
                message: 'I am good, how about you?',
                from: {
                  identity: 'agent',
                  isLocal: false,
                  name: 'Agent',
                  audioTrackPublications: new Map(),
                  videoTrackPublications: new Map(),
                  trackPublications: new Map(),
                  audioLevel: 0,
                },
              } as ReceivedChatMessage,
            ]}
          />
        </div>
      </Container>
    </>
  );
}
