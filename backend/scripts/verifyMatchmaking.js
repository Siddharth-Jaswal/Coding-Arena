const io = require('socket.io-client');
const axios = require('axios');
const uuid = require('uuid').v4;

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function registerAndLogin(username) {
    const email = `${username}@example.com`;
    const password = 'StrongPassword123';
    
    // Register
    await axios.post(`${API_URL}/auth/register`, { username, email, password });
    
    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
    return loginRes.data.data.token;
}

function connectSocket(token) {
    return new Promise((resolve, reject) => {
        const socket = io(SOCKET_URL, {
            auth: { token }
        });
        socket.on('connect', () => resolve(socket));
        socket.on('connect_error', (err) => reject(err));
    });
}

async function run() {
    console.log(`\n=== Verifying Matchmaking & Room Service ===\n`);
    
    try {
        const randomString = uuid().split('-')[0];
        const user1 = `player1_${randomString}`;
        const user2 = `player2_${randomString}`;

        console.log(`[1] Registering and authenticating players...`);
        const token1 = await registerAndLogin(user1);
        const token2 = await registerAndLogin(user2);
        console.log('✅ Authentication successful');

        console.log(`\n[2] Connecting WebSockets...`);
        const socket1 = await connectSocket(token1);
        const socket2 = await connectSocket(token2);
        console.log('✅ WebSockets connected');

        // Setup Match Promise
        const matchFoundPromise = new Promise(resolve => {
            let matches = 0;
            let roomData = null;
            
            const handleMatch = (socketName) => (data) => {
                console.log(`✅ ${socketName} received MATCH_FOUND for room: ${data.roomId}`);
                if (!roomData) roomData = data;
                matches++;
                if (matches === 2) resolve(roomData);
            };

            socket1.on('MATCH_FOUND', handleMatch('Player 1'));
            socket2.on('MATCH_FOUND', handleMatch('Player 2'));
        });

        console.log(`\n[3] Player 1 joining queue...`);
        socket1.emit('JOIN_QUEUE');
        await new Promise(resolve => socket1.on('QUEUE_JOINED', resolve));
        console.log('✅ Player 1 in queue');

        console.log(`\n[4] Player 2 joining queue...`);
        socket2.emit('JOIN_QUEUE');
        await new Promise(resolve => socket2.on('QUEUE_JOINED', resolve));
        console.log('✅ Player 2 in queue');

        console.log(`\n[5] Waiting for match...`);
        const matchData = await matchFoundPromise;
        console.log(`✅ Match created successfully: ${matchData.roomId}`);

        console.log(`\n[6] Joining Room Namespace...`);
        socket1.emit('JOIN_ROOM', { roomId: matchData.roomId });
        socket2.emit('JOIN_ROOM', { roomId: matchData.roomId });
        
        await Promise.all([
            new Promise(resolve => socket1.on('ROOM_JOINED', resolve)),
            new Promise(resolve => socket2.on('ROOM_JOINED', resolve))
        ]);
        console.log('✅ Both players joined room namespace');

        console.log(`\n[7] Emitting READY...`);
        
        const countdownPromise = Promise.all([
            new Promise(resolve => socket1.once('COUNTDOWN_STARTED', resolve)),
            new Promise(resolve => socket2.once('COUNTDOWN_STARTED', resolve))
        ]);

        socket1.emit('READY', { roomId: matchData.roomId });
        setTimeout(() => {
            socket2.emit('READY', { roomId: matchData.roomId });
        }, 100);

        await countdownPromise;
        console.log('✅ COUNTDOWN_STARTED broadcasted to both players');

        console.log(`\n🎉 Matchmaking Verification Complete!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

run();
