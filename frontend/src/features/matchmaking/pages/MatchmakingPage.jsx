import React, { useState } from 'react';
import { PageWrapper, Container, Section, GridLayout } from '@/components/layout';
import { GridOverlay } from '@/components/ui/Backgrounds';
import { useMatchmakingStore } from '../store/useMatchmakingStore';
import { useMatchmakingSocket } from '../hooks/useMatchmakingSocket';
import { GAME_MODES, MATCHMAKING_STATES } from '../constants/matchmaking.constants';

// Components
import { MatchmakingHero } from '../components/MatchmakingHero';
import { QueueHeader } from '../components/QueueHeader';
import { QueueCard } from '../components/QueueCard';
import { QueueTimeline } from '../components/QueueTimeline';
import { GameModeCard } from '../components/GameModeCard';
import { MatchmakingRules } from '../components/MatchmakingRules';
import { QueueStatistics } from '../components/QueueStatistics';
import { ServerStatusCard } from '../components/ServerStatusCard';
import { RecentMatchesCard } from '../components/RecentMatchesCard';
import { FutureFeaturesGrid } from '../components/FutureFeaturesGrid';
import { MatchFoundOverlay } from '../components/MatchFoundOverlay';

const MatchmakingPage = () => {
  const { status, elapsedTime, estimatedTime, error } = useMatchmakingStore();
  const { findMatch, cancelSearch } = useMatchmakingSocket();
  
  const [selectedMode, setSelectedMode] = useState('ranked');

  // Prevent modifying mode while queued/searching
  const isLocked = status !== MATCHMAKING_STATES.IDLE && status !== MATCHMAKING_STATES.CANCELLED;

  return (
    <PageWrapper>
      <MatchFoundOverlay />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GridOverlay />
      </div>
      <Container className="py-8 relative z-10">
        
        {/* Header & Hero */}
        <Section>
          <MatchmakingHero />
          <QueueHeader />
        </Section>

        {/* Core Queue Area */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Timeline & Rules */}
            <div className="space-y-6">
              <QueueTimeline status={status} />
              <MatchmakingRules />
            </div>

            {/* Center Col: Queue Card */}
            <div className="lg:col-span-2">
              <QueueCard 
                status={status} 
                elapsedTime={elapsedTime} 
                estimatedTime={estimatedTime}
                onFindMatch={findMatch}
                onCancel={cancelSearch}
              />
              
              {/* Game Modes */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-foreground/80">Select Game Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {GAME_MODES.map((mode) => (
                    <GameModeCard 
                      key={mode.id} 
                      mode={mode} 
                      isSelected={selectedMode === mode.id}
                      onClick={() => !isLocked && setSelectedMode(mode.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Stats & History */}
        <Section className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-8">
              <QueueStatistics />
              <ServerStatusCard />
            </div>
            <div className="md:col-span-2">
              <RecentMatchesCard />
            </div>
          </div>
        </Section>

        {/* Future Features */}
        <Section className="mt-12 border-t border-border/50 pt-12">
          <FutureFeaturesGrid />
        </Section>

      </Container>
    </PageWrapper>
  );
};

export default MatchmakingPage;
