# Milestone 2: Battle Arena & Submission Lifecycle

This document serves as the comprehensive single source of truth for the architecture and implementation of the Battle Arena completed during **Milestone 2**. It is designed to onboard new developers into the coding workspace environment without requiring deep dives into the source code first.

---

## 1. Milestone Overview

### Purpose
The purpose of Milestone 2 was to construct a highly resilient, professional-grade coding workspace (the "Battle Arena") and seamlessly integrate it with the finalized backend Submission API. 

### Why the Battle Arena Exists
The Battle Arena is the core interaction point of Coding Arena. It bridges the gap between reading algorithmic challenges and actively solving them in a VS Code-like environment. It handles code authoring, test execution, backend communication, and verdict rendering in real-time.

### The User Journey
```text
Landing Page
      ↓
Problem Browser
      ↓
Problem Details
      ↓
[ Enter Battle Arena ]
      ↓
Read Problem & Author Code
      ↓
Submit Solution
      ↓
Live Polling (Queued -> Running -> Completed)
      ↓
Render Final Verdict
```

---

## 2. Battle Arena Architecture

The architecture enforces strict separation of concerns, decoupling UI components from network logic.

### ASCII Component Hierarchy
```text
<ArenaLayout> (Global layout wrapper)
  ├── <ArenaHeader> (Navigation, metadata, multiplayer placeholders)
  └── <ArenaPage> (The orchestrator)
        └── <SplitPane direction="horizontal">
              ├── <ProblemPanel> (Continuous scroll reading pane)
              └── <SplitPane direction="vertical">
                    ├── <div className="editor-container">
                    │     ├── <EditorPanel> (Monaco wrapper)
                    │     └── <ActionBar> (Language toggle & run/submit)
                    └── <BottomPanel> (Workspace outputs)
                          ├── <Console> (Chronological timeline)
                          ├── <Test Cases> (Future public run integration)
                          ├── <SubmissionStatus> (Rich structured metadata)
                          └── <Judge Logs> (Detailed outputs)
```

### Responsibilities
- **`ArenaPage`**: The page-level orchestrator. It fetches the problem data, mounts the layout, and composes the `useSubmission` hook.
- **`ProblemPanel`**: Displays the problem statement, constraints, formats, and sample tests in a clean, scrollable view.
- **`EditorPanel`**: Wraps `@monaco-editor/react`, managing the editor instance, syntax themes, and local storage state.
- **`BottomPanel`**: A multi-tab container representing the "terminal" area of the workspace.
- **`ActionBar`**: Houses the language selector, "Run Code", and "Submit" triggers safely below the editor.
- **`SubmissionStatus`**: A purely presentational component that maps backend verdicts to visual design tokens.

---

## 3. Workspace Layout

The Battle Arena features a dual-pane, infinitely resizable workspace layout powered by a custom `SplitPane` implementation.

### Desktop Wireframe
```text
+-------------------------------------------------------------+
|  < ArenaHeader (Back | Title | Difficulty | Network Info) > |
+-----------------------------+-------------------------------+
|                             |                               |
| ProblemPanel                | EditorPanel                   |
| - Statement                 | - Code Authoring              |
| - Input Format              | - Auto-saving                 |
| - Output Format             |                               |
| - Constraints               +-------------------------------+
| - Sample Tests              | ActionBar  [C++] [Run] [Sub]  |
|                             +-------------------------------+
|                             | BottomPanel (Tabs)            |
|                             | - Console                     |
|                             | - Submission Tab              |
+-----------------------------+-------------------------------+
```

- **Left Panel:** Dedicated purely to reading the problem. Uses continuous scrolling instead of internal tabs to reduce cognitive load.
- **Right Panel:** Contains a vertically split coding environment (Editor on top, Terminal on bottom).

---

## 4. Monaco Editor Integration

The `EditorPanel` leverages `@monaco-editor/react` to provide a VS Code-tier authoring experience directly in the browser.

- **Dynamic Theme:** Monaco's theme is mapped dynamically to the global Design System (Fluxora Dark).
- **Default C++ Template:** Injects a standard `#include <iostream>` boilerplate when loading a fresh editor.
- **LocalStorage Persistence:** Code is continuously saved to `localStorage` keyed by `arena_code_${problemId}_${language}`. Refreshing the page never drops unsubmitted work.
- **Save Indicator:** A subtle `SaveStatus` component indicates when changes are synced to memory.
- **Keyboard Shortcuts:** `Ctrl+Enter` is bound to the Submit action. `Ctrl+S` forces a manual sync.
- **Language Selector:** Pluggable `ActionBar` dropdown allows dynamic language switching.
- **Future Extensibility:** Capable of mounting Language Server Protocol (LSP) web workers for real-time IntelliSense.

---

## 5. Submission Lifecycle

The complete lifecycle is managed asynchronously using React Query mutations and background polling.

### Sequence Diagram
```text
User               UI (ArenaPage)          useSubmission Hook         Backend API
 |                       |                         |                       |
 |-- Clicks Submit ----->|                         |                       |
 |                       |--- mutate(code) ------->|                       |
 |                       |                         |-- POST /submit ------>|
 |                       |                         |<-- { id, status } ----|
 |                       |<-- Set active sub ------|                       |
 |<-- UI: "Queued" ------|                         |                       |
 |                       |                         |=== Poll GET /id =====>|
 |                       |<-- update status -------|<-- { status: run }----|
 |<-- UI: "Running" -----|                         |                       |
 |                       |                         |=== Poll GET /id =====>|
 |                       |<-- update status -------|<-- { verdict: AC } ---|
 |<-- UI: "Accepted" ----|                         |                       |
```

- **React Query:** Manages both the initial POST (`useMutation`) and the polling loop (`useQuery`).
- **Polling:** `refetchInterval: 1000` automatically triggers a poll every second.
- **Cleanup / Stop Conditions:** Polling halts instantly when `status === "completed"`, a polling error occurs, or the component unmounts.

---

## 6. Bottom Panel

The `BottomPanel` is a generic tabbed workspace container. 

| Tab Name | Responsibility | Separation Strategy |
| :--- | :--- | :--- |
| **Console** | Chronological execution timeline. | Displays plain text logs (e.g., `[10:15:00] Judge started`). Never duplicates structured metadata. |
| **Test Cases** | Sample test explorer. | Reserved for public test case execution and custom input testing via the upcoming Run API. |
| **Submission**| Rich metadata representation. | Dedicated purely to parsing backend objects and rendering visual verdict cards and timing data. |
| **Judge Logs** | Granular compiler errors. | Reserved for viewing heavy stack traces or compilation outputs without muddying the main timeline. |

---

## 7. Test Cases

- **Public Test Cases:** Displayed in the `ProblemPanel` as `SampleTestCard` components.
- **Hidden Test Cases:** The Submission API evaluates against hidden tests to prevent hardcoding. The UI intentionally **never** exposes hidden inputs or outputs. It only displays the final summarized verdict (e.g., Wrong Answer on Test 4).
- **Run Code Integration:** "Run Code" is currently a mockup. In the future, it will target public test cases exclusively to allow rapid local debugging before a formal submission.

---

## 8. SubmissionStatus Component

`SubmissionStatus.jsx` translates raw backend JSON into user-facing design tokens.

- **Empty State:** Friendly fallback when `activeSubmission` is null.
- **Polling State:** Renders an animated pulse (`Listening for updates...`) and an animated `Loader2` while status is `queued` or `running`.
- **Verdict Mapping:**
  - `Accepted` ➔ Emerald (`success` Badge + `CheckCircle2`)
  - `Wrong Answer` ➔ Rose (`destructive` Badge + `XCircle`)
  - `Compilation Error` ➔ Amber (`warning` Badge + `AlertTriangle`)
  - `Runtime Error` ➔ Orange (`warning` Badge + `AlertTriangle`)
  - `Time Limit Exceeded` ➔ Yellow (`warning` Badge + `Clock`)
- **Metadata:** Conditionally renders `Execution Time`, `Created At`, `Started At`, and `Finished At` only when non-null.

---

## 9. Console Timeline

The `useSubmission` hook maintains a chronological string state representing the system timeline.
- **Timestamp Format:** Injects standard `[HH:MM:SS]` formatting before every event.
- **Lifecycle Messages:** Pushes discreet updates when transitioning between `Queued`, `Running`, and `Completed`.
- **Timeline:** Separates execution blocks visually using dashed lines (`-------`).

---

## 10. State Management

The frontend embraces server-state driven UI over local generic stores (like Redux).

### Data Flow Diagram
```text
[ React Query Cache ] <======> [ useSubmission.js ] <======> [ ArenaPage.jsx ]
         |                             |                              |
         | (Background Polling)        | (Mutation + Query)           | (Props)
         v                             v                              v
[ Backend API ] <======> [ submissionApi.js ]           [ SubmissionStatus.jsx ]
```

- **API Layer:** `client.js` handles Axios interceptors (unwrapping `.data` and throwing `Error` instances).
- **Hooks:** `useSubmission.js` abstracts all networking, mutation states, and console string generation away from the React component tree.
- **Components:** Act purely as reactive view layers listening to the hook outputs.

---

## 11. Design System Usage

No duplicate UI primitives were created during this milestone. The Arena strictly reuses the Milestone 1 design system:
- **`SplitPane`**: Used for resizable layout management.
- **`Button` / `Badge`**: Used in ActionBar and SubmissionStatus.
- **`Card`**: Used internally within BottomPanel contents.
- **`SampleTestCard`**: Shared between Problem Browser and Arena.
- **Motion:** Reuses `fadeSlideUp`, `staggerChildren`, and standard easings from `src/lib/motion.js`.

---

## 12. Responsiveness

- **Desktop/Tablet:** Full dual-pane split view utilizing all vertical and horizontal estate.
- **Split Panes:** Allow users to favor the Problem statement or the Editor manually via dragging.
- **Overflow Management:** Custom scrollbars (`custom-scrollbar` class) applied strictly to internal containers (like `ProblemPanel` and `EditorPanel`) rather than the `<body>`, ensuring the ActionBar and Headers always remain fixed on screen.

---

## 13. Future Extension Points

The architecture guarantees that future milestones can be integrated without redesigning the Arena:
- **Run Code:** Connect to the future `/api/run` endpoint directly within `ActionBar` and output to the `Test Cases` tab.
- **Multiplayer WebSockets:** Hook Zustand / Socket.io into the placeholders in `ArenaHeader.jsx` to render live opponents and matchmaking timers.
- **AI Analysis:** Mount a new `AI Assistant` tab dynamically into the `BottomPanel` tabs array.

---

## 14. File Structure

### Modified / Created Files
- `src/pages/ArenaPage.jsx`: Top-level orchestrator.
- `src/components/arena/ArenaHeader.jsx`: Top navigation.
- `src/components/arena/ProblemPanel.jsx`: Problem viewing pane.
- `src/components/arena/EditorPanel.jsx`: Monaco Code Editor integration.
- `src/components/arena/ActionBar.jsx`: Language switching and submission actions.
- `src/components/arena/BottomPanel.jsx`: Generic tab container.
- `src/components/arena/SubmissionStatus.jsx`: **[NEW]** Renders structured verdict metadata.
- `src/components/arena/SaveStatus.jsx`: LocalStorage saving indicator.
- `src/hooks/useSubmission.js`: **[NEW]** Custom React Query polling hook for submission lifecycle.
- `src/services/submissionService.js`: Abstract execution mocks (used exclusively for Run Code).
- `src/api/submissions.js`: API bindings for the backend endpoints.
- `src/api/client.js`: Modified to throw explicit `Error` instances upon Axios failure.

---

## 15. Lessons Learned

The success of Milestone 2 was driven by strict adherence to these architectural principles:
- **UI Separated from Networking:** Components do not fetch. Hooks fetch. Components render.
- **React Query for Async:** Complex polling workflows (which traditionally require messy `useEffect` loops and memory leaks) were elegantly solved by simply toggling React Query's `refetchInterval` dynamically based on the submission `status`.
- **Resilient UI:** Building layout components (`SplitPane`, `BottomPanel`) abstractly allowed us to drop in highly complex logic without breaking the grid or overflowing the screen.
- **Data unwrapping:** Relying on global interceptors requires careful attention to Promise chains to avoid "Double Unwrap" TypeError bugs (`.then(res => res.data.data)`). Explicit error handling in the API layer drastically reduces debugging time.
