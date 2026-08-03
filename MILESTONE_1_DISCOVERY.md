# Milestone 1: Problem Discovery Experience

==================================================
## 1. MILESTONE OVERVIEW
==================================================
Milestone 1 successfully established the **Problem Discovery Experience** for the Coding Arena frontend.

The primary objective was to build a complete, production-ready frontend for browsing and viewing coding problems by consuming the **frozen** backend API, without modifying any backend logic or architecture.

The resulting implementation seamlessly integrates with the existing Fluxora-inspired Design System, ensuring the application feels like a premium, cohesive competitive programming platform.

==================================================
## 2. ARCHITECTURAL ACCOMPLISHMENTS
==================================================

### Strict Backend Consumption
- We treated the Node.js/Express backend as the absolute source of truth.
- Created robust `useQuery` integrations using `@tanstack/react-query` to consume:
  - `GET /api/problems` (Lightweight metadata list)
  - `GET /api/problems/:id` (Full problem definition and test cases)
- Avoided CORS blocking dynamically by leveraging Vite's `server.proxy`, eliminating the need to mutate the backend's security headers.
- Successfully configured local `.env` variables to stabilize the backend Postgres/Neon connection.

### Design System Expansion
Instead of building one-off, page-specific UI, we built foundational primitives into `src/components/`:
1. **`Table.jsx`**: A highly responsive, composable data-table component.
2. **`EmptyState.jsx`**: A standardized, icon-driven fallback UI for empty searches.
3. **`ErrorState.jsx`**: A standardized destructive-styled UI block handling API failures gracefully.
4. **`SampleTestCard.jsx`**: A domain-specific component rendering code inputs/outputs side-by-side, equipped with a stateful `navigator.clipboard` Copy button.

==================================================
## 3. PAGES IMPLEMENTED
==================================================

### 1. Problem Browser (`/problems`)
- Displays the complete problem bank in a responsive layout.
- **Desktop Layout:** Renders as a sleek, borderless `Table`.
- **Mobile Layout:** Gracefully degrades into a stack of `ProblemCard` elements.
- **Frontend Filtering:**
  - Implemented a 300ms debounced search filtering by Title or ID.
  - Implemented dropdown filters for `Difficulty` (Easy, Medium, Hard).
  - Implemented dynamic Tag filtering (tags are extracted on-the-fly from the API response).
- **Pagination:** Clean, client-side pagination allowing 10 problems per page, automatically resetting to page 1 upon filter updates.

### 2. Problem Details (`/problems/:id`)
- A comprehensive view for a single coding challenge.
- **Header:** Prominently displays the Problem ID, Title, Difficulty Badge, and dynamic Tag badges.
- **Metadata Bar:** A glassmorphism container highlighting the Time Limit (ms) and Memory Limit (MB) with standard Lucide icons.
- **Prose Content:** Neatly formatted markdown-style blocks mapping to the backend's `statement`, `input_format`, `output_format`, and `constraints`.
- **Sample Tests Grid:** A 2-column responsive `GridLayout` stretching horizontally, rendering reusable `SampleTestCard`s for every public test case provided by the filesystem database.

==================================================
## 4. VERIFICATION AND QUALITY ASSURANCE
==================================================
- **Loading States:** Implemented layout-aware `Skeleton` loaders that mimic the final rendered DOM footprint to eliminate layout shift (CLS).
- **Error Recovery:** Both pages gracefully capture Axios errors and present the `ErrorState` with a one-click "Try Again" refetch button.
- **Layout Consistency:** 
  - Overrode default `Stack` component alignments (`align="start"`) with explicit `align="stretch"` ensuring responsive data tables and grids span full width dynamically.
  - Standardized centered page containers to `max-w-5xl` to prevent layout reflow during list filtering.
- **Custom UI Hardening:** 
  - Upgraded the custom framer-motion `<Select>` dropdowns with `useRef` and `mousedown` event listeners to cleanly handle click-outside close behaviors.
  - Solved `z-index` and glassmorphism stacking context collisions to guarantee dropdown menus definitively overlay data tables.

==================================================
## 5. NEXT STEPS (MILESTONE 2 PREPARATION)
==================================================
With the Problem Discovery phase complete, the frontend is now ready to begin development on the **Battle Workspace**.
This will involve building the split-pane Monaco Editor layout and connecting it to the `/api/submissions` POST endpoints.
