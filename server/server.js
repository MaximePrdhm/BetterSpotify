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

// Authentication
app.post('/login', (req, res) => {
    const code = req.body.code;

    console.log("Login Endpoint Reached");

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
        //console.log(err);
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
        //console.log(err);
        res.sendStatus(400);
    });
})


// Websockets
io.on('connection', (socket) => {
    console.log('User connected - ', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected - ', socket.id);
    })
})


// Endpoint
server.listen(3001, () =>{
    console.log('Server running...');
});
