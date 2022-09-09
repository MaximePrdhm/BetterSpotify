require('dotenv').config()
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server }  = require('socket.io');
const axios = require('axios');
const qs = require('qs')

const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const app = express();
app.use(cors());
app.use(bodyParser.json())

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

const rooms = [];

// Room API
app.get('/rooms', (req, res) => {
    res.json(rooms);
})

// Authentication
app.post('/login', (req, res) => {
    const code = req.body.code;

    axios.post('https://accounts.spotify.com/api/token', qs.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
    }),{
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' +
                Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`)
                    .toString('base64')
                    .trim(),
        }
    }).then((data) => {
        res.json({
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expiresIn: data.data.expires_in
        });
    }).catch((err) => {
        res.sendStatus(400);
    });
});

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;

    axios.post('https://accounts.spotify.com/api/token', qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    }),{
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' +
                Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`)
                    .toString('base64')
                    .trim(),
        }
    }).then((data) => {
        res.json({
            accessToken: data.data.access_token,
            expiresIn: data.data.expires_in
        });
    }).catch((err) => {
        res.sendStatus(400);
    });
})

// Websockets
io.on('connection', (socket) => {
    console.log('User connected - ', socket.id);

    // Rooms || Outside
    socket.on('create_room', (data) => {
        let roomId = createNewRoom();
        removeUserFromExistingRooms(data.user.id);

        const room = rooms.find(r => r.id === roomId);
        room.members.push({ id: data.user.id, name: data.user.display_name, avatar: data.user.images[0].url || '' });

        socket.emit('room_joined',  { room: room.id });
        socket.join(roomId);
    });

    socket.on('join_room', (data) => {
        if(data.room === '') {
            socket.emit('room_error', { error: 'room_argument_invalid', data: data.room }); 
        } else if(!rooms.find(r => r.id === parseInt(data.room))) {
            socket.emit('room_error', { error: 'room_not_found', data: data.room }); 
        } else {
            removeUserFromExistingRooms(data.user.id);
            const room = rooms.find(r => r.id === parseInt(data.room));
            
            room.members.push({ id: data.user.id, name: data.user.display_name, avatar: data.user.images[0].url || '' })

            socket.emit('room_joined',  { room: room.id });
            socket.join(parseInt(data.room));
        }
    })

    // Rooms || Inside
    socket.on('user_join_room', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));

        io.to(data.room).emit('user_joined_room', { room: data.room, users: target.members, userJoining: target.members.find(m => m.id === data.user.id), queue: target.queue } );
    })

    socket.on('user_leave_room', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));
        const user = target.members.find(m => m.id === data.user.id);

        removeUserFromExistingRooms(data.user.id);

        io.to(data.room).emit('user_left_room', { room: data.room, users: target.members, userLeaving: user });
    })

    socket.on('add_track_to_queue', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));
        target.queue.push(data.track);
        
        io.to(data.room).emit('track_added_to_queue', { room: data.room, queue: target.queue, trackAdded: data.track });
    })

    socket.on('queue_reset_request', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));
        target.queue = [];
        
        io.to(data.room).emit('queue_reset', { room: data.room, queue: target.queue });
    })

    socket.on('queue_shuffle_request', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));
        
        const queue = target.queue;
        const shuffled = queue.sort((a, b) => 0.5 - Math.random());
        target.queue = shuffled;
        
        io.to(data.room).emit('queue_shuffled', { room: data.room, queue: target.queue });
    })

    socket.on('queue_delete_request', (data) => {
        const target = rooms.find(r => r.id === parseInt(data.room));
        let newQueue = target.queue.filter(t => data.tracks.findIndex(track => track === t.uuid) === -1);
        target.queue = newQueue;

        io.to(data.room).emit('queue_tracks_deleted', { room: data.room, queue: target.queue });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected - ', socket.id);
    })
})


// Endpoint
server.listen(3001, () =>{
    console.log('Server running...');
});


// Room Management
function createNewRoom() {
    let id;
    do {
        id = Math.floor((Math.random() * (99999999-10000000)) + 10000000);
    } while(rooms.find(r => r.id === id))
    
    const room = { createdAt: new Date().getTime(), id: id, members: [], queue: [] };
    rooms.push(room);

    return room.id;
}

function removeUserFromExistingRooms(userId) {
    const roomIndex = rooms.findIndex(r => r.members.some(m => m.id === userId));
    if(roomIndex >= 0) {
        const memberIndex = rooms[roomIndex].members.findIndex(m => m.id === userId);
        
        if(memberIndex >= 0)
            rooms[roomIndex].members.splice(memberIndex, 1);

        if(rooms[roomIndex].members.length === 0)
            rooms.splice(roomIndex, 1);
    }
}