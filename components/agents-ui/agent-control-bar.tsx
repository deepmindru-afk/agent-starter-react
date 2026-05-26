'use client';

import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { Track } from 'livekit-client';
import { CommandIcon, Loader, MessageSquareTextIcon, SendHorizontal } from 'lucide-react';
import { type MotionProps, motion } from 'motion/react';
import { useChat } from '@livekit/components-react';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import { AgentTrackControl } from '@/components/agents-ui/agent-track-control';
import {
  AgentTrackToggle,
  agentTrackToggleVariants,
} from '@/components/agents-ui/agent-track-toggle';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  type UseInputControlsProps,
  useInputControls,
  usePublishPermissions,
} from '@/hooks/agents-ui/use-agent-control-bar';
import { cn } from '@/lib/shadcn/utils';

const LK_TOGGLE_VARIANT_1 = [
  'data-[state=off]:bg-accent data-[state=off]:hover:bg-foreground/10',
  'data-[state=off]:[&_~_button]:bg-accent data-[state=off]:[&_~_button]:hover:bg-foreground/10',
  'data-[state=off]:border-border data-[state=off]:hover:border-foreground/12',
  'data-[state=off]:[&_~_button]:border-border data-[state=off]:[&_~_button]:hover:border-foreground/12',
  'data-[state=off]:text-destructive data-[state=off]:hover:text-destructive data-[state=off]:focus:text-destructive',
  'data-[state=off]:focus-visible:ring-foreground/12 data-[state=off]:focus-visible:border-ring',
  'dark:data-[state=off]:[&_~_button]:bg-accent dark:data-[state=off]:[&_~_button]:hover:bg-foreground/10',
];

const LK_TOGGLE_VARIANT_2 = [
  'data-[state=off]:bg-accent data-[state=off]:hover:bg-foreground/10',
  'data-[state=off]:border-border data-[state=off]:hover:border-foreground/12',
  'data-[state=off]:focus-visible:border-ring data-[state=off]:focus-visible:ring-foreground/12',
  'data-[state=off]:text-foreground data-[state=off]:hover:text-foreground data-[state=off]:focus:text-foreground',
  'data-[state=on]:bg-blue-500/20 data-[state=on]:hover:bg-blue-500/30',
  'data-[state=on]:border-blue-700/10 data-[state=on]:text-blue-700 data-[state=on]:ring-blue-700/30',
  'data-[state=on]:focus-visible:border-blue-700/50',
  'dark:data-[state=on]:bg-blue-500/20 dark:data-[state=on]:text-blue-300',
];

const MOTION_PROPS: MotionProps = {
  variants: {
    hidden: {
      height: 0,
      opacity: 0,
      marginBottom: 0,
    },
    visible: {
      height: 'auto',
      opacity: 1,
      marginBottom: 12,
    },
  },
  initial: 'hidden',
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const COMMANDS = [
  { command: '/help', description: 'Show available commands', example: '/help' },
  { command: '/clear', description: 'Clear the chat transcript', example: '/clear' },
  { command: '/feedback', description: 'Send feedback about the agent', example: '/feedback The agent was helpful' },
  { command: '/summarize', description: 'Summarize the conversation', example: '/summarize' },
  { command: '/voice', description: 'Switch to voice-only mode', example: '/voice' },
] as const;

function getCommandFromText(text: string): string | null {
  const match = text.match(/(?:^|\s)(\/[a-zA-Z]*)$/);
  return match ? match[1] : null;
}

function getCommandText(text: string): string {
  const match = text.match(/(?:^|\s)(\/[a-zA-Z]*)/);
  return match ? match[0].trimStart() : '';
}

interface AgentChatInputProps {
  chatOpen: boolean;
  onSend?: (message: string) => void;
  className?: string;
}

function AgentChatInput({ chatOpen, onSend = async () => {}, className }: AgentChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const isDisabled = isSending || message.trim().length === 0;

  const activeCommandPrefix = useMemo(() => getCommandFromText(message), [message]);
  const filteredCommands = useMemo(() => {
    if (!activeCommandPrefix) return [];
    const query = activeCommandPrefix.toLowerCase();
    return COMMANDS.filter((c) => c.command.startsWith(query));
  }, [activeCommandPrefix]);

  const isCommandActive = showCommands && filteredCommands.length > 0;

  useEffect(() => {
    setShowCommands(activeCommandPrefix !== null);
    setSelectedIndex(0);
  }, [activeCommandPrefix]);

  const handleSelectCommand = (cmd: (typeof COMMANDS)[number]) => {
    const text = getCommandText(message);
    const before = message.slice(0, message.lastIndexOf(text));
    const after = message.slice(message.lastIndexOf(text) + text.length);
    setMessage(before + cmd.command + ' ' + after);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (isDisabled) {
      return;
    }

    try {
      setIsSending(true);
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isCommandActive) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectCommand(filteredCommands[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleButtonClick = async () => {
    if (isDisabled) return;
    await handleSend();
  };

  useEffect(() => {
    if (chatOpen) return;
    inputRef.current?.focus();
  }, [chatOpen]);

  return (
    <div className={cn('relative mb-3 flex grow flex-col text-sm', className)}>
      {isCommandActive && (
        <div
          ref={listRef}
          role="listbox"
          className="bg-popover text-popover-foreground border-border absolute bottom-full left-0 right-0 mb-2 rounded-lg border p-1 shadow-md"
        >
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.command}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => handleSelectCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                i === selectedIndex && 'bg-muted text-foreground'
              )}
            >
              <CommandIcon className="text-muted-foreground size-4 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{cmd.command}</span>
                <span className="text-muted-foreground text-xs">{cmd.description}</span>
              </div>
              <span className="text-muted-foreground ml-auto hidden truncate text-xs md:block">
                {cmd.example}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="flex grow items-end gap-2 rounded-md pl-1">
        <textarea
          autoFocus
          ref={inputRef}
          value={message}
          disabled={!chatOpen || isSending}
          placeholder="Type / for commands, or type something..."
          onKeyDown={handleKeyDown}
          onChange={(e) => setMessage(e.target.value)}
          className="field-sizing-content max-h-16 min-h-8 flex-1 resize-none py-2 text-base [scrollbar-width:thin] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          size="icon"
          type="button"
          disabled={isDisabled}
          variant={isDisabled ? 'secondary' : 'default'}
          title={isSending ? 'Sending...' : 'Send'}
          onClick={handleButtonClick}
          className="self-end disabled:cursor-not-allowed"
        >
          {isSending ? <Loader className="animate-spin" /> : <SendHorizontal />}
        </Button>
      </div>
    </div>
  );
}

/** Configuration for which controls to display in the AgentControlBar. */
export interface AgentControlBarControls {
  /**
   * Whether to show the leave/disconnect button.
   *
   * @defaultValue true
   */
  leave?: boolean;
  /**
   * Whether to show the camera toggle control.
   *
   * @defaultValue true (if camera publish permission is granted)
   */
  camera?: boolean;
  /**
   * Whether to show the microphone toggle control.
   *
   * @defaultValue true (if microphone publish permission is granted)
   */
  microphone?: boolean;
  /**
   * Whether to show the screen share toggle control.
   *
   * @defaultValue true (if screen share publish permission is granted)
   */
  screenShare?: boolean;
  /**
   * Whether to show the chat toggle control.
   *
   * @defaultValue true (if data publish permission is granted)
   */
  chat?: boolean;
}

export interface AgentControlBarProps extends UseInputControlsProps {
  /**
   * The visual style of the control bar.
   *
   * @default 'default'
   */
  variant?: 'default' | 'outline' | 'livekit';
  /**
   * This takes an object with the following keys: `leave`, `microphone`, `screenShare`, `camera`,
   * `chat`. Each key maps to a boolean value that determines whether the control is displayed.
   *
   * @default
   * {
   *   leave: true,
   *   microphone: true,
   *   screenShare: true,
   *   camera: true,
   *   chat: true,
   * }
   */
  controls?: AgentControlBarControls;
  /**
   * Whether to save user choices.
   *
   * @default true
   */
  saveUserChoices?: boolean;
  /**
   * Whether the agent is connected to a session.
   *
   * @default false
   */
  isConnected?: boolean;
  /**
   * Whether the chat input interface is open.
   *
   * @default false
   */
  isChatOpen?: boolean;
  /** The callback for when the user disconnects. */
  onDisconnect?: () => void;
  /** The callback for when the chat is opened or closed. */
  onIsChatOpenChange?: (open: boolean) => void;
  /** The callback for when a device error occurs. */
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces. Provides controls for
 * microphone, camera, screen share, chat, and disconnect. Includes an expandable chat input for
 * text-based interaction with the agent.
 *
 * @example
 *
 * ```tsx
 * <AgentControlBar
 *   variant="livekit"
 *   isConnected={true}
 *   onDisconnect={() => handleDisconnect()}
 *   controls={{
 *     microphone: true,
 *     camera: true,
 *     screenShare: false,
 *     chat: true,
 *     leave: true,
 *   }}
 * />;
 * ```
 *
 * @extends ComponentProps<'div'>
 */
export function AgentControlBar({
  variant = 'default',
  controls,
  isChatOpen = false,
  isConnected = false,
  saveUserChoices = true,
  onDisconnect,
  onDeviceError,
  onIsChatOpenChange,
  className,
  ...props
}: AgentControlBarProps & ComponentProps<'div'>) {
  const { send } = useChat();
  const publishPermissions = usePublishPermissions();
  const [isChatOpenUncontrolled, setIsChatOpenUncontrolled] = useState(isChatOpen);
  const {
    microphoneTrack,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleSendMessage = async (message: string) => {
    await send(message);
  };

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  const isEmpty = Object.values(visibleControls).every((value) => !value);

  if (isEmpty) {
    console.warn('AgentControlBar: `visibleControls` contains only false values.');
    return null;
  }

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-input/50 dark:border-muted flex flex-col border p-3 drop-shadow-md/3',
        variant === 'livekit' ? 'rounded-[31px]' : 'rounded-lg',
        className
      )}
      {...props}
    >
      <motion.div
        {...MOTION_PROPS}
        inert={!(isChatOpen || isChatOpenUncontrolled)}
        animate={isChatOpen || isChatOpenUncontrolled ? 'visible' : 'hidden'}
        className="border-input/50 flex w-full items-start overflow-hidden border-b"
      >
        <AgentChatInput
          chatOpen={isChatOpen || isChatOpenUncontrolled}
          onSend={handleSendMessage}
          className={cn(variant === 'livekit' && '[&_button]:rounded-full')}
        />
      </motion.div>

      <div className="flex gap-1">
        <div className="flex grow gap-1">
          {/* Toggle Microphone */}
          {visibleControls.microphone && (
            <AgentTrackControl
              variant={variant === 'outline' ? 'outline' : 'default'}
              kind="audioinput"
              aria-label="Toggle microphone"
              source={Track.Source.Microphone}
              pressed={microphoneToggle.enabled}
              disabled={microphoneToggle.pending}
              audioTrack={microphoneTrack}
              onPressedChange={microphoneToggle.toggle}
              onActiveDeviceChange={handleAudioDeviceChange}
              onMediaDeviceError={handleMicrophoneDeviceSelectError}
              className={cn(
                variant === 'livekit' && [
                  LK_TOGGLE_VARIANT_1,
                  'rounded-full [&_button:first-child]:rounded-l-full [&_button:last-child]:rounded-r-full',
                ]
              )}
            />
          )}

          {/* Toggle Camera */}
          {visibleControls.camera && (
            <AgentTrackControl
              variant={variant === 'outline' ? 'outline' : 'default'}
              kind="videoinput"
              aria-label="Toggle camera"
              source={Track.Source.Camera}
              pressed={cameraToggle.enabled}
              pending={cameraToggle.pending}
              disabled={cameraToggle.pending}
              onPressedChange={cameraToggle.toggle}
              onMediaDeviceError={handleCameraDeviceSelectError}
              onActiveDeviceChange={handleVideoDeviceChange}
              className={cn(
                variant === 'livekit' && [
                  LK_TOGGLE_VARIANT_1,
                  'rounded-full [&_button:first-child]:rounded-l-full [&_button:last-child]:rounded-r-full',
                ]
              )}
            />
          )}

          {/* Toggle Screen Share */}
          {visibleControls.screenShare && (
            <AgentTrackToggle
              variant={variant === 'outline' ? 'outline' : 'default'}
              aria-label="Toggle screen share"
              source={Track.Source.ScreenShare}
              pressed={screenShareToggle.enabled}
              disabled={screenShareToggle.pending}
              onPressedChange={screenShareToggle.toggle}
              className={cn(variant === 'livekit' && [LK_TOGGLE_VARIANT_2, 'rounded-full'])}
            />
          )}

          {/* Toggle Transcript */}
          {visibleControls.chat && (
            <Toggle
              variant={variant === 'outline' ? 'outline' : 'default'}
              pressed={isChatOpen || isChatOpenUncontrolled}
              aria-label="Toggle transcript"
              onPressedChange={(state) => {
                if (!onIsChatOpenChange) setIsChatOpenUncontrolled(state);
                else onIsChatOpenChange(state);
              }}
              className={agentTrackToggleVariants({
                variant: variant === 'outline' ? 'outline' : 'default',
                className: cn(variant === 'livekit' && [LK_TOGGLE_VARIANT_2, 'rounded-full']),
              })}
            >
              <MessageSquareTextIcon />
            </Toggle>
          )}
        </div>

        {/* Disconnect */}
        {visibleControls.leave && (
          <AgentDisconnectButton
            onClick={onDisconnect}
            disabled={!isConnected}
            className={cn(
              variant === 'livekit' &&
                'bg-destructive/10 dark:bg-destructive/10 text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/20 focus:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/4 rounded-full font-mono text-xs font-bold tracking-wider'
            )}
          >
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </AgentDisconnectButton>
        )}
      </div>
    </div>
  );
}
