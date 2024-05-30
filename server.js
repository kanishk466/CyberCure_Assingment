const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

let users = {}; // To store usernames and their socket IDs

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Connected...');

    socket.on('register', (username) => {
        users[username] = socket.id;
        socket.username = username;
        console.log(users);
    });

    socket.on('private_message', ({ to, message }) => {
        const toSocketId = users[to];
        if (toSocketId) {
            io.to(toSocketId).emit('private_message', {
                from: socket.username,
                message
            });
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.username];
        console.log(users);
    });
});
