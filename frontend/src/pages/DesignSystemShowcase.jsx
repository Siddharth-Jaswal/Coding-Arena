import React, { useState } from 'react';
import { PageWrapper, Container, Stack, GridLayout } from '@/components/layout';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, Textarea, SearchBar, Select, Checkbox, Switch } from '@/components/ui/Forms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { Modal, Drawer } from '@/components/ui/Overlay';
import { InteractiveCard, EditorCard, ConsoleCard } from '@/components/common/DomainCards';
import { DifficultyBadge, VerdictBadge } from '@/components/common/Badges';
import { StatCard } from '@/components/common/StatCard';
import { Pagination } from '@/components/ui/Pagination';
import { Trophy, Activity, Terminal } from 'lucide-react';

const DesignSystemShowcase = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <PageWrapper className="pb-24">
      <Container className="pt-24">
        <div className="mb-16">
          <h1 className="text-6xl font-bold tracking-tightest mb-4">Design System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The single source of truth for the Coding Arena visual language. 
            Built on Fluxora DNA, optimized for competitive programming.
          </p>
        </div>

        <Stack gap={12}>
          {/* Colors */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tighter mb-6 border-b border-border/50 pb-2">Color Palette</h2>
            <GridLayout cols={4}>
              {['bg-background', 'bg-card', 'bg-primary', 'bg-destructive', 'bg-success', 'bg-warning', 'bg-muted', 'bg-border'].map(c => (
                <div key={c} className="flex flex-col gap-2">
                  <div className={`h-24 rounded-lg border border-border/50 ${c}`} />
                  <span className="text-sm font-mono text-muted-foreground">{c.replace('bg-', '')}</span>
                </div>
              ))}
            </GridLayout>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tighter mb-6 border-b border-border/50 pb-2">Buttons</h2>
            <Stack gap={6}>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="glass">Glass</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <IconButton icon={Terminal} />
              </div>
            </Stack>
          </section>

          {/* Forms */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tighter mb-6 border-b border-border/50 pb-2">Inputs & Forms</h2>
            <GridLayout cols={2}>
              <Stack>
                <Input placeholder="Default input..." />
                <SearchBar placeholder="Search problems..." />
                <Select value="1" options={[{label: 'Option 1', value: '1'}, {label: 'Option 2', value: '2'}]} onChange={() => {}} />
              </Stack>
              <Stack>
                <Textarea placeholder="Type something..." />
                <div className="flex gap-6">
                  <Checkbox id="c1" label="Accept terms" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                  <Switch id="s1" label="Dark mode" checked={switchOn} onChange={setSwitchOn} />
                </div>
              </Stack>
            </GridLayout>
          </section>

          {/* Domain Cards */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tighter mb-6 border-b border-border/50 pb-2">Domain Cards</h2>
            <GridLayout cols={3}>
              <StatCard title="Rating" value="1,842" trend={12} icon={Trophy} />
              <StatCard title="Problems Solved" value="342" icon={Activity} />
              <InteractiveCard>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Interactive Glass Card</h3>
                  <p className="text-sm text-muted-foreground">Hover over me to see the motion lift and shadow effects.</p>
                </CardContent>
              </InteractiveCard>
            </GridLayout>
            <GridLayout cols={2} className="mt-6">
              <EditorCard language="Python" className="h-[200px]" />
              <ConsoleCard status="running" output="> Executing test cases...\n> Test 1: Passed\n> Test 2: Pending..." className="h-[200px]" />
            </GridLayout>
          </section>

          {/* Feedback & Overlays */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tighter mb-6 border-b border-border/50 pb-2">Feedback & Overlays</h2>
            <Stack gap={6}>
              <div className="flex gap-4 items-center">
                <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
                <Spinner />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="flex gap-4 flex-wrap">
                <DifficultyBadge difficulty="easy" />
                <DifficultyBadge difficulty="medium" />
                <DifficultyBadge difficulty="hard" />
                <VerdictBadge verdict="accepted" />
                <VerdictBadge verdict="wrong_answer" />
                <VerdictBadge verdict="pending" />
              </div>
              <Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />
            </Stack>
          </section>
        </Stack>
      </Container>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="System Modal">
        <p className="text-muted-foreground mb-6">This is a premium modal featuring spring physics and a glass backdrop blur.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navigation Drawer">
        <p className="text-muted-foreground">Slide-in drawer for settings or mobile navigation.</p>
      </Drawer>
    </PageWrapper>
  );
};

export default DesignSystemShowcase;
