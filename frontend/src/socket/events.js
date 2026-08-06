// This is an architectural placeholder for the Socket.IO event mappings.
// These map directly to the backend socket events defined in backend/src/socket/events.js

export const CLIENT_EVENTS = {
    JOIN_QUEUE: 'JOIN_QUEUE',
    LEAVE_QUEUE: 'LEAVE_QUEUE',
    JOIN_ROOM: 'JOIN_ROOM',
    READY: 'READY',
    PING: 'PING'
};

export const SERVER_EVENTS = {
    QUEUE_JOINED: 'QUEUE_JOINED',
    QUEUE_LEFT: 'QUEUE_LEFT',
    MATCH_FOUND: 'MATCH_FOUND',
    ROOM_CREATED: 'ROOM_CREATED',
    ROOM_JOINED: 'ROOM_JOINED',
    COUNTDOWN_STARTED: 'COUNTDOWN_STARTED',
    CONTEST_STARTED: 'CONTEST_STARTED',
    PLAYER_SUBMITTED: 'PLAYER_SUBMITTED',
    SCORE_UPDATED: 'SCORE_UPDATED',
    MATCH_FINISHED: 'MATCH_FINISHED',
    ERROR: 'ERROR'
};
