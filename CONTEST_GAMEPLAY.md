# Contest Gameplay Architecture

This document outlines the architecture, state transitions, and event flow for the Live Contest Multiplayer experience in Coding Arena (Milestone 4D).

## Contest Lifecycle
A contest progresses through strict, sequential states managed by `MatchContext.jsx`. The source of truth for all transitions is the backend Socket.IO events.

1. **Waiting (`waiting`)**
   - The user has joined the room.
   - The UI displays a "Waiting for opponent" or pre-match lobby screen.
   - `ROOM_JOINED` has been received.

2. **Countdown (`countdown`)**
   - Both players are ready.
   - The backend emits `COUNTDOWN_STARTED` with `startsInSeconds`.
   - `CountdownOverlay` is mounted and runs a purely visual local tick down to 0, ending with "GO!".
   - `ArenaWorkspace` is mounted but strictly `readOnly`.

3. **Running (`running`)**
   - The backend emits `CONTEST_STARTED`.
   - `CountdownOverlay` unmounts.
   - `ArenaWorkspace` unlocks (editable, runnable, submittable).
   - Real-time `SCORE_UPDATED` events flow in as players submit.

4. **Finished (`finished`)**
   - The backend emits `MATCH_FINISHED` when the timer expires.
   - `ArenaWorkspace` is locked into review mode (`readOnly`).
   - `ProblemNavigator` is disabled to prevent context switching.
   - `MatchResultModal` appears showing the winner and final scores.

## Socket.IO Event Flow

The frontend acts as a reactive consumer of the backend's state machine. 

### Server -> Client Events
- `ROOM_JOINED`: Confirms the socket is attached to the room channel.
- `COUNTDOWN_STARTED`: `{ startsInSeconds }` - Triggers the visual countdown.
- `CONTEST_STARTED`: `{ startedAt, durationSeconds, endsAt }` - Unlocks the workspace.
- `SCORE_UPDATED`: `{ userId, problemId, verdict, pointsAwarded, newTotalScore }`
- `MATCH_FINISHED`: `{ winnerId, finalScores }` - Locks the workspace, shows results.
- `PLAYER_DISCONNECTED` / `PLAYER_RECONNECTED`: Updates opponent connection status.

### Client -> Server Events
- `JOIN_ROOM`: Emitted on mount.
- `READY`: Emitted automatically after joining to signal the frontend is prepared for the countdown.

## Score & Problem State Synchronization

When `SCORE_UPDATED` is received:
1. **LiveScoreboard**: The `scores` dictionary is updated with `payload.newTotalScore`. Framer-motion automatically animates the number change.
2. **ProblemNavigator**: The `payload.problemId` is appended to either `solvedProblemIds` (if `Accepted`) or `attemptedProblemIds`. This updates the visual dots on the left sidebar.
3. **MatchEventFeed**: A synthetic local event is generated and pushed to the `events` array, structured for presentation ("You got Accepted on a problem!"). The feed auto-scrolls to the newest entry using `AnimatePresence`.

## Submission Lifecycle Integration
The `useSubmission.js` hook manages REST API polling independently of the Socket.IO score updates. A successful submission does not guarantee a score update (e.g. if the problem was already solved). 

1. **Submission Initiated**: `WorkspaceContext` intercepts the `onSubmit` or `onRun` action and aggressively switches the `BottomPanel` to the Console (0) or Submission (2) tab.
2. **Queued**: The backend returns a job ID.
3. **Running**: The frontend polls and detects `status === 'running'`. Console messages are appended.
4. **Completed**: The backend worker evaluates the code, updates the DB, and emits `SCORE_UPDATED` via Redis Emitter if applicable. The frontend poll completes simultaneously.

## Architecture Preservation
`ArenaWorkspace` remains entirely multiplayer-agnostic. It does not know about Socket.IO, rooms, countdowns, or opponents. 

`ContestPage` bridges the gap by consuming `MatchContext` and supplying `WorkspaceConfig` (e.g. `readOnly: status !== 'running'`) to the `WorkspaceProvider`.

## Future Extension Points
- **Room Sync (`ROOM_SYNC`)**: If a player disconnects and reconnects mid-contest, the backend should emit a full state snapshot (`ROOM_SYNC`). `MatchContext` is structurally prepared to hydrate from this payload.
- **Penalty & Attempts**: The `LiveScoreboard` and `PlayerCard` components have hidden layout placeholders for time-penalties and attempt counters.
- **Rematch**: The `MatchResultModal` can easily accept an `onRematch` callback to re-queue the players together.
