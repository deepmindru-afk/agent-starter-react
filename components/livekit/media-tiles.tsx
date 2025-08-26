import React, { useMemo } from 'react';
// import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
// import {
//   type TrackReference,
//   useLocalParticipant,
//   // useTracks,
//   // useVoiceAssistant,
// } from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { AgentTile } from './agent-tile';
import { AvatarTile } from './avatar-tile';
import { VideoTile } from './video-tile';
import { useAgentSession } from '@/agent-sdk';

const MotionVideoTile = motion.create(VideoTile);
const MotionAgentTile = motion.create(AgentTile);
const MotionAvatarTile = motion.create(AvatarTile);

const animationProps = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0,
  },
  transition: {
    type: 'spring',
    stiffness: 675,
    damping: 75,
    mass: 1,
  },
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

// export function useLocalTrackRef(source: Track.Source) {
//   const { localParticipant } = useLocalParticipant();
//   const publication = localParticipant.getTrackPublication(source);
//   const trackRef = useMemo<TrackReference | undefined>(
//     () => (publication ? { source, participant: localParticipant, publication } : undefined),
//     [source, publication, localParticipant]
//   );
//   return trackRef;
// }

interface MediaTilesProps {
  chatOpen: boolean;
}

export function MediaTiles({ chatOpen }: MediaTilesProps) {
  const {
    connectionState,
    agent,
    local,
  } = useAgentSession();

  const legacyState = useMemo((): 'disconnected' | 'connecting' | 'initializing' | 'listening' | 'thinking' | 'speaking' => {
    if (connectionState === 'disconnected' || connectionState === 'connecting') {
      return connectionState;
    } else {
      switch (agent?.conversationalState) {
        case 'initializing':
        case 'idle':
          return 'initializing';

        default:
          return agent?.conversationalState ?? 'initializing';
      }
    }
  }, [connectionState, agent?.conversationalState]);

  // const { legacyState: agentState } = useAgentState();
  // const { audioTrack: agentAudioTrack, videoTrack: agentVideoTrack } = useAgentTracks();
  // const {
  //   // state: agentState,
  //   audioTrack: agentAudioTrack,
  //   videoTrack: agentVideoTrack,
  // } = useVoiceAssistant();
  // console.log('TRACKS:', agentAudioTrack, agentVideoTrack);
  // const [screenShareTrack] = useTracks([Track.Source.ScreenShare]); // FIXME: replace with agent alternative
  // const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera); // FIXME: replace with agent alternative
  // const { camera: { track: cameraTrack } } = useAgentLocalParticipant();

  const isCameraEnabled = local?.camera?.enabled ?? false;//cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = local?.screenShare?.enabled ?? false; //screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const transition = {
    ...animationProps.transition,
    delay: chatOpen ? 0 : 0.15, // delay on close
  };
  const agentAnimate = {
    ...animationProps.animate,
    scale: chatOpen ? 1 : 3,
    transition,
  };
  const avatarAnimate = {
    ...animationProps.animate,
    transition,
  };
  const agentLayoutTransition = transition;
  const avatarLayoutTransition = transition;

  const isAvatar = Boolean(agent?.camera?.enabled ?? false);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          {/* agent */}
          <div
            className={cn([
              'grid',
              // 'bg-[hotpink]', // for debugging
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && classNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // audio-only agent
                <MotionAgentTile
                  key="agent"
                  layoutId="agent"
                  {...animationProps}
                  animate={agentAnimate}
                  transition={agentLayoutTransition}
                  state={legacyState}
                  agent={agent}
                  className={cn(chatOpen ? 'h-[90px]' : 'h-auto w-full')}
                />
              )}
              {isAvatar && (
                // avatar agent
                <MotionAvatarTile
                  key="avatar"
                  layoutId="avatar"
                  {...animationProps}
                  animate={avatarAnimate}
                  transition={avatarLayoutTransition}
                  track={agent?.camera}
                  className={cn(
                    chatOpen ? 'h-[90px] [&>video]:h-[90px] [&>video]:w-auto' : 'h-auto w-full'
                  )}
                />
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid',
              chatOpen && classNames.secondTileChatOpen,
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* camera */}
            <AnimatePresence>
              {local?.camera && isCameraEnabled && (
                <MotionVideoTile
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  {...animationProps}
                  track={local.camera}
                  transition={{
                    ...animationProps.transition,
                    delay: chatOpen ? 0 : 0.15,
                  }}
                  className="h-[90px]"
                />
              )}
              {/* screen */}
              {local?.screenShare && isScreenShareEnabled && (
                <MotionVideoTile
                  key="screen"
                  layout="position"
                  layoutId="screen"
                  {...animationProps}
                  track={local.screenShare}
                  transition={{
                    ...animationProps.transition,
                    delay: chatOpen ? 0 : 0.15,
                  }}
                  className="h-[90px]"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
