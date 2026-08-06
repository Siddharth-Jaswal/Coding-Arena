# Milestone 3: Authentication & User Dashboard

This document details the architecture and implementation of the Authentication and User Dashboard phase of the Coding Arena. The primary goal was to securely integrate the backend authentication system while preserving the existing Design System and seamlessly blending the authenticated experience into the current workspace.

---

## 1. Authentication Architecture

The frontend embraces a robust JWT-based session architecture, utilizing React Query for server state management and a custom Context for session hydration.

### JWT Flow
1. **Login/Register:** User submits credentials via the `authApi`.
2. **Persistence:** The backend returns a JWT which is stored in `localStorage` under the key `arena_token`.
3. **Interception:** A global Axios interceptor (`api/client.js`) intercepts all outgoing requests and automatically injects the `Authorization: Bearer <token>` header.
4. **Invalidation:** If the backend responds with `401 Unauthorized` (e.g., expired token), the interceptor dispatches a custom window event (`auth:unauthorized`), triggering an immediate client-side logout and state purge.

### Session Restoration
Upon a hard refresh or application startup, the `AuthContext` checks for the presence of `arena_token`.
- If found, it immediately executes a React Query `getMe` request (`/api/users/me`).
- If successful, the `user` state is hydrated and the session is restored without the user needing to log back in.
- If it fails (e.g. 401), the token is purged and the user is redirected to `/login`.

---

## 2. Protected Routing

We introduced two higher-order route guarding components to secure the application hierarchy:

### `<ProtectedRoute>`
Wraps authenticated routes (like `/dashboard`, `/profile`, `/problems/:id/solve`). If the user is unauthenticated, it intercepts the render and redirects to `/login`. It also handles displaying a loading spinner during the initial session restoration phase.

### `<PublicOnlyRoute>`
Wraps authentication entry points (like `/login`, `/register`). If a user is already authenticated and attempts to visit these pages, they are safely redirected to their `/dashboard` instead.

---

## 3. Dashboard Architecture

The Dashboard (`/dashboard`) serves as the user's competitive programming home base. It was built entirely by composing existing primitives (`Card`, `Badge`, `Button`, `Container`, `PageWrapper`) to ensure a unified visual aesthetic.

### Layout Hierarchy
1. **Welcome Section:** Personalized greeting and quick "Continue Solving" call-to-action.
2. **Stats Grid:** 4-column micro-card layout displaying `Rating`, `Problems Solved`, `Wins`, and `Losses`.
3. **Activity Split:** 
   - **Main Column:** A chronological list of the user's most recent submissions, mapping backend verdicts to the Design System's standard badge colors.
   - **Sidebar:** Visual placeholders for upcoming multiplayer features (`Matchmaking` and `Leaderboard`).

---

## 4. Profile Architecture

The Profile Page (`/profile`) provides a deeper look into the user's identity and performance history.

### Layout Hierarchy
1. **Identity Column (Left):** Prominent avatar placeholder, username, display name, email, and account management actions (Edit Profile, Sign Out).
2. **Statistics Column (Right):** A detailed "Competitive Overview" utilizing the glassmorphic `Card` component, exposing underlying backend schema fields (`rating`, `problemsSolved`, `wins`, `losses`, `draws`, `createdAt`).
3. **Extension Points:** Reserved placeholder cards for `Achievements` and `Match History`.

---

## 5. API Integration & React Query

Networking was strictly decoupled from UI presentation. 

### API Layer
- **`src/api/auth.js`**: Exposes `login()` and `register()`.
- **`src/api/users.js`**: Exposes `getMe()`, `updateProfile()`, `getMySubmissions()`, and `getMySolvedProblems()`.

### React Query Strategy
- **Mutations:** Login and Registration utilize `useMutation` inside the `AuthContext` to easily manage `isPending` states and error handling without muddying the UI components.
- **Queries:** Profile and Dashboard data rely on `useQuery` to seamlessly fetch, cache, and serve real-time statistics (e.g. `queryKey: ['user', 'submissions']`).
- **Cache Purging:** Upon logging out, `queryClient.clear()` is called to ensure sensitive user data is wiped from memory instantly.

---

## 6. Component Hierarchy & Folder Structure

```text
src/
 ├── api/
 │    ├── auth.js            # [NEW] Auth endpoints
 │    ├── users.js           # [NEW] User endpoints
 │    └── client.js          # [MODIFIED] Added JWT interceptor
 ├── components/
 │    ├── auth/
 │    │    ├── ProtectedRoute.jsx   # [NEW]
 │    │    └── PublicOnlyRoute.jsx  # [NEW]
 │    └── common/
 │         └── Navbar.jsx    # [MODIFIED] Dynamic auth states
 ├── contexts/
 │    └── AuthContext.jsx    # [NEW] Central session manager
 ├── pages/
 │    ├── LoginPage.jsx      # [NEW]
 │    ├── RegisterPage.jsx   # [NEW]
 │    ├── DashboardPage.jsx  # [NEW] Replaces placeholder
 │    └── ProfilePage.jsx    # [NEW] Replaces placeholder
 └── routes/
      └── index.jsx          # [MODIFIED] Injects route guards
```

---

## 7. Future Extension Points

This milestone prepared the architecture for the subsequent multiplayer and social phases:
- **WebSockets / Matchmaking:** The authentication token can now be passed as a handshake payload to socket servers, enabling secure PvP matchmaking.
- **Public Profiles:** The `/profile` route can easily be refactored to accept a `/:username` parameter for viewing opponents.
- **Leaderboards:** Rating data is now actively queried and rendered, paving the way for a global ranking table.
