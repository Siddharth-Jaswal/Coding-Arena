# Frontend Architecture Document: Coding Arena

## 1. Project Overview
Coding Arena is a high-stakes, real-time multiplayer competitive programming platform. Unlike traditional coding practice websites (like LeetCode or HackerRank) which treat problem-solving as an isolated, academic exercise, Coding Arena is built around a competitive gaming loop. Developers face off head-to-head in algorithmic battles, climbing global leaderboards, and claiming ELO points.

### Frontend Goals
- **Immersive Experience**: The frontend must feel like a competitive gaming lobby (e.g., Chess.com, Valorant) rather than a B2B SaaS product.
- **Extreme Performance**: Algorithmic battles are won in milliseconds. The frontend must be fast, avoiding unnecessary re-renders, with instantaneous feedback and zero layout shift.
- **Modularity & Scalability**: The frontend acts as a robust foundation capable of accommodating complex future features like real-time WebSockets, live spectating, and team battles without massive refactoring.

### Why React + Vite?
- **Vite**: Chosen for its near-instant cold server start times, incredibly fast Hot Module Replacement (HMR), and optimized out-of-the-box build step using esbuild. It massively accelerates developer velocity compared to CRA or heavier frameworks.
- **React**: Provides a robust, declarative component model. Given the highly interactive nature of the application (real-time editor syncing, timers, state updates), React's state-driven architecture is critical.

### Why JavaScript (over TypeScript)?
JavaScript was intentionally selected to maximize velocity, flexibility, and rapid prototyping during the early phases of the project. While TypeScript offers compile-time safety, it can introduce overhead in type maintenance. Robust linting, clear component contracts (props), and centralized state management are heavily utilized to prevent the standard pitfalls of vanilla JavaScript.

---

## 2. Technology Stack
The technology stack was carefully curated to minimize bloat while maximizing UX quality and developer experience.

| Dependency | Purpose & Justification |
| :--- | :--- |
| **React (v18)** | Core view layer. Selected for its massive ecosystem and declarative UI paradigm. |
| **Vite** | Build tool and dev server. Selected for extreme speed and minimal configuration overhead. |
| **Tailwind CSS** | Styling engine. Selected for rapid utility-first styling. It avoids the performance overhead of CSS-in-JS (like styled-components) while keeping styles colocated with components. |
| **Framer Motion** | Animation engine. Critical for the "Fluxora evolved" design philosophy. It handles complex layout animations, staggered children, and spring physics natively. |
| **Lucide React** | Iconography. A lightweight, consistent SVG icon library that fits the modern, clean aesthetic of the platform perfectly. |
| **React Router (v6)** | Client-side routing. Utilizes `createBrowserRouter` to enable future features like nested routing, data loaders, and lazy-loading of heavy pages. |
| **Zustand** | Global state management. Selected over Redux or Context API because it is lightweight, requires zero boilerplate, and avoids Provider hell while handling real-time game state effectively. |
| **Axios** | HTTP client. Selected over native `fetch` for its powerful interceptor support (critical for auth token injection and global error handling). |
| **clsx & tailwind-merge** | Utility functions (`cn`). Used to merge Tailwind classes intelligently without conflicts when composing components. |

---

## 3. Folder Architecture
The project utilizes a feature-driven, strictly modular folder structure to enforce separation of concerns.

```text
frontend/
├── src/
│   ├── api/            # API integration layer (Axios instances, endpoint functions)
│   ├── components/     # UI primitives and shared components
│   │   ├── common/     # Domain-specific components (DomainCards, StatCard, Navbar)
│   │   ├── layout/     # Structural components (Container, Stack, SplitPane)
│   │   └── ui/         # Base UI components (Button, Forms, Backgrounds, Overlays)
│   ├── layouts/        # High-level route wrappers (LandingLayout, AppLayout, ArenaLayout)
│   ├── lib/            # Third-party wrappers and core utilities (motion.js, utils.js)
│   ├── pages/          # Full page components and route entry points
│   │   └── Landing/    # Sub-directory for modular Landing Page sections
│   ├── providers/      # React Context providers (QueryClient, Auth, Theme)
│   ├── routes/         # Router configuration and lazy-loading boundaries
│   ├── store/          # Zustand global state modules
│   └── styles/         # Global CSS, Tailwind entry points, CSS variables
```

### Responsibility Breakdown
- **`components/ui/`**: "Dumb" presentation components. They have no knowledge of the application state. They take props and render HTML.
- **`components/common/`**: "Smart" or domain-aware components. A `StatCard` or `EditorCard` belongs here because it understands the business logic of Coding Arena.
- **`layouts/`**: Defines the surrounding UI for a group of pages (e.g., the `ArenaLayout` hides the standard Navbar to maximize screen real estate during a match).
- **`pages/`**: The glue. Pages fetch data (or trigger hooks) and pass that data down into components. 

---

## 4. Design Philosophy
The visual identity of Coding Arena is heavily inspired by **Fluxora**, acting as the benchmark for implementation quality. However, Coding Arena evolves this SaaS aesthetic into a competitive programming environment.

### Fluxora Inspirations (Preserved)
- **Extreme Depth**: Utilizing 8-layer deep backgrounds with grids, noise, and radial glows.
- **Glassmorphism**: Extensive use of `backdrop-blur`, semi-transparent backgrounds (`bg-white/5`), and inner shadows (`shadow-[inset_...]`).
- **Precision Typography**: Tight tracking (`tracking-tighter`), contrasting font weights, and gradient text for primary headings.
- **Micro-interactions**: Everything reacts to the user. Buttons press in (`scale: 0.97`), cards lift (`y: -4`), and glows intensify on hover.

### Intentional Deviations
- **No SaaS Fluff**: We avoided soft, friendly illustrations or generic "features" grids. Everything is angular, dark, and performance-focused.
- **Monospace Dominance**: Due to the target audience (developers), monospace fonts and terminal-like UI elements (`ConsoleCard`) are heavily integrated into the marketing material itself.
- **Aggressive Accent Colors**: We use highly saturated accents (`hsl(var(--primary))`, destructive reds, warning yellows) to communicate urgency and competition.

---

## 5. Design System
The design system is codified entirely within `tailwind.config.js` and `styles/globals.css`. 

### Tokens
- **Colors**: Based entirely on HSL variables for dynamic theming. 
  - `background`: Deep neutral (`#050505`).
  - `card`: Slightly elevated neutral (`#0a0a0a`).
  - `primary`: A vibrant, electric cyan/blue.
  - `destructive`, `warning`, `success`: Standardized semantic colors for verdicts (Accepted, Wrong Answer, Pending).
- **Border System**: Instead of solid borders, we utilize `border-border/50` or custom `.border-gradient` utilities to create 1px glowing strokes.
- **Shadow System**: 
  - `shadow-soft`: For modal elevation.
  - `shadow-glow-primary`: A massive, blurred radial drop shadow that bleeds color into the background.
- **Typography**: Inter (or system sans-serif) for UI, and `ui-monospace` for all code-related components.

### Utilities (`lib/utils.js`)
The `cn()` utility combines `clsx` and `tailwind-merge`. This allows us to pass `className` to any component and override default Tailwind classes without CSS specificity clashes.

---

## 6. Background System
The background architecture (`components/ui/Backgrounds.jsx`) is a composite of 3 layered primitives:

1. **`GridOverlay`**: An SVG pattern rendering a subtle 40px dotted/dashed grid at `0.03` opacity. Gives technical texture.
2. **`RadialGlow`**: Large, heavily blurred (`blur-[100px]`) divs absolute-positioned at the corners to bleed primary/success colors into the deep background.
3. **`NoiseTexture`**: An SVG fractal noise filter applied with `mix-blend-overlay` at `0.04` opacity to break up CSS gradient banding and add a premium matte finish.

**Usage**: The `PageBackground` component wraps all of these into a single fixed layer. Future pages simply wrap their content in `<PageWrapper withBackground={true}>`.

---

## 7. Motion Library
All animation configurations are centralized in `src/lib/motion.js` to ensure consistent easing across the platform.

- **`standardEase`**: `[0.16, 1, 0.3, 1]` - The signature snappy, premium ease-out curve.
- **`fadeSlideUp`**: Used for scroll-reveals. Elements start blurred and lower, then snap into focus.
- **`hoverLift` & `cardHover`**: Moves elements up by `-4px` and intensifies shadows on hover.
- **`hoverGlow`**: Injects a massive primary-colored box-shadow on hover (used for primary CTAs).
- **`buttonPress`**: Standard `whileTap={{ scale: 0.97 }}` for tactile feedback.
- **`pageTransition`**: Blur/opacity transitions used on route changes.
- **`staggerChildren`**: Parent variant to trigger children animations sequentially (`staggerChildren: 0.1`).

---

## 8. Layout System
Layout primitives prevent duplicated margin/padding CSS and ensure a consistent rhythm.

| Component | Purpose |
| :--- | :--- |
| **`PageWrapper`** | The root layout for a route. Applies the `pageTransition` and injects the `PageBackground`. |
| **`Container`** | Constrains max-width (`max-w-7xl`) and handles responsive horizontal padding (`px-4 md:px-8`). |
| **`Section`** | Handles vertical rhythm (`py-12 md:py-24`). |
| **`Stack`** | A flexbox abstraction. Handles direction, alignment, and gaps. Prevents inline flex classes everywhere. |
| **`GridLayout`** | A CSS grid abstraction. Responsive by default (1 col on mobile -> 2/3/4 cols on desktop based on `cols` prop). |
| **`SplitPane`** | A dual-pane flex layout with a visual drag-handle divider. Primarily built for the Editor/Console layout. |

---

## 9. Component Library
The UI foundation is built from scratch utilizing Framer Motion and standard HTML, ensuring zero dependency bloat while maintaining extreme customization.

### UI Base (`components/ui/`)
- **`Button`**: The core interactive element. Supports variants (`primary`, `secondary`, `outline`, `ghost`, `glass`, `danger`). Integrates `buttonPress` and `hoverGlow` automatically based on the variant.
- **`IconButton`**: A wrapper around `Button` specific for SVG icons.
- **`Input` & `Textarea` & `SearchBar`**: Form primitives featuring active border glows (`focus-visible:ring-primary/50`). SearchBar automatically injects a Lucide search icon.
- **`Select`**: A custom, headless-style dropdown built entirely with Framer Motion (`dropdownTransition`) since standard `<select>` cannot be styled heavily.
- **`Checkbox` & `Switch`**: Custom form toggles.
- **`Card`**: Standard content boundary. Supports a `glass` variant.
- **`Modal` & `Drawer` (`Overlay.jsx`)**: Global overlay components utilizing `AnimatePresence`. `Modal` utilizes a spring physics transition, while `Drawer` slides in from the left/right. Includes backdrop blur.
- **`Pagination`**: Reusable page navigation.
- **`Badge` & `Skeleton` & `Spinner`**: Status and loading primitives.

### Domain Components (`components/common/`)
- **`InteractiveCard`**: Extends `Card` with `cardHover` physics.
- **`StatCard`**: Standardized metric display (used for ELO, latency).
- **`EditorCard`**: A mock UI wrapper that looks like a code editor (header with language, monospace body).
- **`ConsoleCard`**: A terminal-like output box. Handles `status` (running/idle) and renders a pulsing indicator.
- **`DifficultyBadge` / `VerdictBadge`**: Domain-specific badges mapped to backend logic (Accepted, Wrong Answer, Hard, Easy).

---

## 10. Routing
Routing is handled by `react-router-dom` using the modern `createBrowserRouter` API.

**Architecture**:
- **Layouts**: Routes are grouped under specific layouts.
  - `/` -> `LandingLayout` -> `LandingPage`
  - `/problems`, `/profile/*` -> `AppLayout` (Includes standard Navbar and Footer).
  - `/problems/:id`, `/submissions/:id` -> `ArenaLayout` (Full screen, no standard navigation, optimized for the Battle editor).
- **Design System**: `/design-system` is an internal-only route used to document and test the component library.
- **Catch-All**: A `*` route pointing to `NotFoundPlaceholder` acts as a 404 handler. (Ensure this is always at the bottom of the route array).

---

## 11. State Management
State is managed via **Zustand**. The store layer is highly modularized, though currently mostly scaffolded for future backend integration.

- **`useUserStore`**: Will hold JWT tokens, active user profile, and current ELO.
- **`useThemeStore`**: Manages light/dark mode preference and applies the class to the document root.
- **`useMatchStore` (Planned)**: Will handle WebSocket active game state, opponent data, and timers.
- **`useNotificationStore` (Planned)**: Will manage global toast notifications.

---

## 12. API Layer
All external communication is localized to `src/api/`.

- **`client.js`**: An Axios instance configured with a `baseURL` mapping to the backend (via `VITE_API_URL`).
- **Interceptors**: Pre-configured to attach JWT tokens to the `Authorization` header automatically, and to handle global `401 Unauthorized` responses by dispatching to the Zustand user store.
- **Modules**: Separate files (`problems.js`, `users.js`) export clean async functions (e.g., `getProblems()`) so components never write raw Axios queries.

---

## 13. Landing Page Architecture
The Landing Page is arguably the most complex page currently implemented. It avoids standard SaaS layouts in favor of an immersive "Gameplay-First" experience.

**Location**: `src/pages/LandingPage.jsx` and `src/pages/Landing/*`

### Section Breakdown
1. **`HeroSection` & `LiveBattleShowcase`**: The hook. Uses a complex `SplitPane` to simulate a live 1v1 matchup. Player 1 types code (`setInterval`), Player 2 compiles and runs tests (`setTimeout`). It immediately proves the platform is for developers.
2. **`MatchTimeline`**: A horizontally scrolling sequence of icons showing the matchmaking flow.
3. **`HowItWorks`**: A 3-column scroll-storytelling section. Breaks down the Queue -> Toss -> Battle phases using staggered `fadeSlideUp` motion.
4. **`GameModes`**: 3 `InteractiveCard` components highlighting Ranked, Toss, and Lobbies.
5. **`WhyCodingArena`**: A split comparison (`GridLayout cols={2}`) showing Traditional Practice (red/destructive) vs Coding Arena (blue/primary).
6. **`PlatformMetrics`**: Real-time performance indicators (Latency < 50ms) using `StatCard`.
7. **`RoadmapTeaser`**: A grid of future features (Spectating, Team Battles).
8. **`FinalCTA`**: Heavy glow background with a large `Button` to capture end-of-page conversions.
9. **`Footer`**: Clean, modular footer layout.

**Responsive Strategy**: 
The entire page gracefully degrades. The `LiveBattleShowcase` split-pane collapses to `flex-col` on mobile, stacking the editors vertically rather than squishing the code horizontally. All `GridLayouts` collapse to 1 column on mobile.

---

## 14. Design System Showcase
**Route**: `/design-system`
**Location**: `src/pages/DesignSystemShowcase.jsx`

This page is the single source of truth for UI development. Whenever a new primitive is created (e.g., a new Toggle component), it **must** be added to this page. 
- It allows developers to test components in isolation without clicking through application logic.
- It acts as a visual contract for the design philosophy.

---

## 15. Coding Standards
1. **Never Duplicate Components**: If you need a button, import `Button`. Do not write `<button className="...">`.
2. **Never Hardcode Colors**: Use semantic tokens. `text-primary`, `bg-background`, `border-border`. Never `#123456`.
3. **Always Use `cn()`**: When a component takes a `className` prop, merge it using `cn("base-classes", className)`.
4. **Motion Exclusivity**: Do not write raw framer-motion variants in components. Import them from `src/lib/motion.js` (e.g., `fadeSlideUp`).
5. **Composition over Inheritance**: Use Layout primitives (`Stack`, `Container`) instead of manually applying flex/margin classes.

---

## 16. Current Project Status

### Implemented
- [x] Complete Vite/React/Tailwind Setup
- [x] Frontend Scaffold & Folder Architecture
- [x] Design System & Tokens
- [x] Complete reusable Component Library (UI + Domain)
- [x] Motion Library (`motion.js`)
- [x] Background & Layout System
- [x] Design System Showcase (`/design-system`)
- [x] Complete Landing Page Implementation

### Planned / Pending Backend Integration
- [ ] Authentication Flow (Login / Signup)
- [ ] Dashboard & Problem Browser (`/problems`)
- [ ] The Battle Arena UI (`/problems/:id`)
- [ ] User Profiles & Submission History
- [ ] WebSocket integration for live matchmaking
- [ ] Leaderboard Implementation

---

## 17. Future Development Workflow
When building new features (e.g., The Dashboard), follow this strict workflow:

1. **UX Planning**: Define what the page needs to achieve.
2. **Wireframes**: Determine layout hierarchy.
3. **Component Review**: Look at the Design System Showcase. Which components can be reused? (e.g., `StatCard`, `GridLayout`).
4. **Implementation**: Build the page combining Layout primitives and UI components.
5. **API Integration**: Create the Axios endpoints in `src/api/`, then wire them into the page using React Query.
6. **Documentation**: If a new reusable UI primitive was required, add it to `/design-system` and update this document.

---

## 18. Best Practices
- **Creating new pages**: Always wrap the root element in `<PageWrapper>`.
- **Handling loading states**: Use `Skeleton` or `Spinner` instead of returning `null`.
- **Handling API Errors**: Ensure Axios interceptors catch global errors (401, 500). Component-level errors should render an `ErrorState` component.
- **Responsiveness**: Always build desktop-first, then verify mobile scaling using Tailwind's `md:` and `lg:` breakpoints. 

---

## 19. Appendix

### Core Layout Hierarchy
```text
<AppProvider> (Contexts: Query, Theme)
  └── <RouterProvider>
        ├── <LandingLayout>
        │     └── <LandingPage>
        ├── <AppLayout>
        │     ├── <Navbar>
        │     ├── <Outlet> (Dashboard, Profile)
        │     └── <Footer>
        └── <ArenaLayout>
              └── <Outlet> (The Battle UI)
```

### Landing Page Composition Tree
```text
<LandingPage>
  ├── <Navbar>
  ├── <HeroSection>
  │     └── <LiveBattleShowcase>
  ├── <MatchTimeline>
  ├── <HowItWorks>
  ├── <GameModes>
  ├── <WhyCodingArena>
  ├── <PlatformMetrics>
  ├── <RoadmapTeaser>
  ├── <FinalCTA>
  └── <Footer>
```
