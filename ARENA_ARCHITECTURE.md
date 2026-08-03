# Coding Arena - Workspace Architecture

## Overview
The Battle Arena Workspace (`ArenaPage.jsx`) is the core coding environment where users read problems, write code, run tests, and submit their solutions. It provides a dual-pane, VS Code-like experience built around React and Monaco Editor.

## Architectural Principles
1. **Decoupled Backend Execution:** The UI contains NO backend knowledge. It triggers abstract methods in `submissionService.js`. When backend endpoints are finalized, only this service layer needs an update.
2. **Local Persistence:** Editor states are strictly bound to `problemId` and `language`, continuously backing up to `localStorage` to prevent accidental data loss on refresh.
3. **Pluggable Architecture:**
   - **BottomPanel:** Uses a generic `tabs` array API, allowing arbitrary new terminal or logging views to be mounted easily.
   - **ArenaHeader:** Designed explicitly with empty space to later accommodate WebSocket-driven real-time multiplayer states (opponents, timers, scores).
4. **Resilient Layout:** Utilizing a custom horizontal AND vertical `SplitPane` implementation, ensuring resizing handles perform smoothly regardless of device screen size.

## Component Breakdown
- **`ArenaPage.jsx`**: The orchestrator. Fetches data, mounts SplitPanes, and handles shared state (like execution results from `submissionService`).
- **`ArenaHeader.jsx`**: Minimal top-level navigation, exposing Problem Title, Difficulty, and multiplayer stubs.
- **`ProblemPanel.jsx`**: Continuous scroll view for Problem data. Designed for high readability without cluttering the UI with nested tabs.
- **`EditorPanel.jsx`**: The Monaco Editor wrapper. Features automatic theme injection to match the Design System, template initialization, and custom command bindings (e.g. `Ctrl+Enter`).
- **`ActionBar.jsx`**: Positioned directly beneath the editor; manages language switching and execution triggers.
- **`BottomPanel.jsx`**: A reusable tabbed container dedicated to system outputs (Console, Test Cases, Judge Logs).

## Future Extension Points
- **Multiplayer State:** Mount a Zustand store specifically for WebSockets to drive the "Match Info" and "Opponent Info" placeholders in the Header.
- **Language Server Protocol (LSP):** Future Monaco capabilities can be unlocked by integrating LSP workers inside `EditorPanel.jsx` for advanced autocompletion.
- **Test Case Explorer:** Transform the current `TestTube` tab in `BottomPanel` into an interactive tree-view showing hidden and public test case execution results sequentially.
