# WebSocket Protocol Specification

This document defines the WebSocket protocol used for real-time matchmaking, room synchronization, and live contests. It serves as the contract between the frontend client, the backend Socket.IO server, and the BullMQ background workers.

## Connection & Authentication

All socket connections must provide a valid JWT in the `auth` payload during the handshake.

**Client Connection:**
```javascript
const socket = io('http://localhost:5000', {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR..."
    }
});
```

**Rejection:**
If the token is invalid or missing, the server will disconnect the socket immediately with an `Error` (e.g., `Unauthorized`).

---

## Client -> Server Events

These events are emitted by the client and handled by the backend server.

### `JOIN_QUEUE`
Requests to join the matchmaking queue.
* **Payload**: None (or optional rating context).
* **Expected Response**: `QUEUE_JOINED` or `ERROR` (e.g., if already in queue).

### `LEAVE_QUEUE`
Requests to leave the matchmaking queue.
* **Payload**: None.
* **Expected Response**: `QUEUE_LEFT`.

### `JOIN_ROOM`
Acknowledges a match and attempts to join the designated contest room.
* **Payload**: `{ roomId: "uuid-string" }`
* **Expected Response**: `ROOM_JOINED` and subsequent `COUNTDOWN_STARTED`.

### `READY`
Signals that the client has loaded the room UI and is ready to start the contest countdown.
* **Payload**: `{ roomId: "uuid-string" }`

### `PING`
Custom application-level ping to measure latency (optional, Socket.IO handles standard pings).

---

## Server -> Client Events

These events are broadcasted by the backend server (or background workers via Redis Emitter) and listened to by the client.

### `QUEUE_JOINED`
Acknowledges successful entry into the queue.
* **Payload**: `{ position: 1, estimatedWaitTime: null }`

### `QUEUE_LEFT`
Acknowledges successful exit from the queue.
* **Payload**: `{ success: true }`

### `MATCH_FOUND`
Broadcasted to two players when a match is successfully made.
* **Payload**:
```json
{
    "roomId": "room:550e8400-e29b-41d4-a716-446655440000",
    "opponent": {
        "id": "uuid",
        "username": "player2",
        "rating": 1500
    }
}
```

### `ROOM_CREATED`
Broadcasted immediately after `MATCH_FOUND`, containing the initial room state.
* **Payload**:
```json
{
    "roomId": "room:uuid",
    "players": {
        "player1Id": { "username": "A" },
        "player2Id": { "username": "B" }
    },
    "problems": [
        { "id": 1, "title": "Two Sum", "difficulty": "Easy" },
        { "id": 2, "title": "Add Two Numbers", "difficulty": "Medium" },
        { "id": 3, "title": "Longest Substring", "difficulty": "Medium" }
    ],
    "scores": {
        "player1Id": 0,
        "player2Id": 0
    },
    "status": "waiting"
}
```

### `ROOM_JOINED`
Acknowledges that the client successfully connected to the socket room namespace.

### `COUNTDOWN_STARTED`
Broadcasted when both players have joined the room and the pre-contest countdown begins.
* **Payload**: `{ startsInSeconds: 10 }`

### `CONTEST_STARTED`
Broadcasted when the countdown reaches 0.
* **Payload**: `{ startedAt: "2026-08-06T12:00:00Z", durationSeconds: 3600 }`

### `PLAYER_SUBMITTED`
Broadcasted by the backend or worker when a player submits code.
* **Payload**: `{ userId: "uuid", problemId: 1, status: "pending" }`

### `SCORE_UPDATED`
Broadcasted by the background worker (via Redis Emitter) when a submission is fully judged and the room state changes.
* **Payload**:
```json
{
    "userId": "uuid",
    "problemId": 1,
    "verdict": "Accepted",
    "pointsAwarded": 100,
    "newTotalScore": 100
}
```

### `MATCH_FINISHED`
Broadcasted when the contest duration expires or a win condition is met.
* **Payload**: `{ winnerId: "uuid", finalScores: { ... } }`

### `ERROR`
General purpose error event.
* **Payload**: `{ message: "String description of the error" }`
