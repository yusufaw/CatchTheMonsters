const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const canvasWidth = 512;
const canvasHeight = 480;
let monster = {};

app.use(express.static('public'));

app.get('/', (req, res) => res.send('Hello Worlds!'));

app.use('/game', express.static(__dirname + '/public'));

io.on('connection', socket => {
    socket.point = 0;
    if (monster.x == undefined) {
        monster.x = 32 + (Math.random() * (canvasWidth - 64));
        monster.y = 32 + (Math.random() * (canvasHeight - 64));
    }

    socket.emit('id', socket.id);
    socket.on('name', data => {
        socket.name = data;
        io.emit('new', {
            speed: 256,
            x: 32 + (Math.random() * (canvasWidth - 64)),
            y: 32 + (Math.random() * (canvasHeight - 64)),
            id: socket.id,
            name: socket.name,
            point: socket.point,
            color: getRandomColor()
        });
        io.emit('monster position', monster);
    });

    socket.on('position', data => {
        io.emit('position', {
            id: socket.id,
            data: data
        });
    });

    socket.on('catch', () => {
        io.emit('update score', {
            id: socket.id,
            point: socket.point += 1
        });

        monster.x = 32 + (Math.random() * (canvasWidth - 64));
        monster.y = 32 + (Math.random() * (canvasHeight - 64));
        io.emit('monster position', monster);
    })

    socket.on('disconnect', () => {
        io.emit('remove', socket.id);
    });
});

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

server.listen(process.env.PORT || 3000, () => {
    console.log('Game server listening on port 3000!');
});
