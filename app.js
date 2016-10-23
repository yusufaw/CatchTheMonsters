var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var canvasWidth = 512;
var canvasHeight = 480;
var monster = {};

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.send('Hello Worlds!');
});

app.use('/game', express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    socket.point = 0;
    if (monster.x == undefined) {
        monster.x = 32 + (Math.random() * (canvasWidth - 64));
        monster.y = 32 + (Math.random() * (canvasHeight - 64));
    }

    socket.emit('id', socket.id);
    socket.on('name', function(data) {
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

    socket.on('position', function(data) {
        io.emit('position', {
            id: socket.id,
            data: data
        });
    });

    socket.on('catch', function() {
        io.emit('update score', {
            id: socket.id,
            point: socket.point += 1
        });

        monster.x = 32 + (Math.random() * (canvasWidth - 64));
        monster.y = 32 + (Math.random() * (canvasHeight - 64));
        io.emit('monster position', monster);
    })

    socket.on('disconnect', function() {
        io.emit('remove', socket.id);
    });
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

server.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
