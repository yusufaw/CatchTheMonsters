// Create the canvas
var name = prompt("Please enter your name", "Mblo");

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var id = "jancok";
canvas.width = 700;
canvas.height = 480;
document.body.appendChild(canvas);

var socket = io();
socket.on('id', function(data) {
    id = data;
})

var hero = {
    speed: 100 // movement in pixels per second
};
var players = {};

socket.emit('name', name);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
    bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function() {
    heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function() {
    monsterReady = true;
};
monsterImage.src = "images/monster.png";

socket.on('new', function(data) {
    players[data.id] = data;
});
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

function ellipse(context, cx, cy, rx, ry, col) {
    context.save(); // save state
    context.beginPath();

    context.translate(cx - rx, cy - ry);
    context.scale(rx, ry);
    context.arc(1, 1, 1, 0, 2 * Math.PI, false);

    context.restore(); // restore to original state
    context.fillStyle = col;
    context.fill();
}

// Update game objects
var update = function(modifier) {
    if (38 in keysDown) { // Player holding up
        if (players[id].y > 0) {
            players[id].y -= players[id].speed * modifier;
        }
    }
    if (40 in keysDown) { // Player holding down
        if (players[id].y < canvas.height - 20) {
            players[id].y += players[id].speed * modifier;
        }
    }
    if (37 in keysDown) { // Player holding left
        if (players[id].x > (0 + 20)) {
            players[id].x -= players[id].speed * modifier;
        }
    }
    if (39 in keysDown) { // Player holding right
        if (players[id].x < (512 - 20)) {
            players[id].x += players[id].speed * modifier;
        }
    }
    socket.emit("position", players[id]);

    if (players[id] != undefined && monsterReady) {
        if (
            players[id].x <= (monster.x + 32) &&
            monster.x <= (players[id].x + 32) &&
            players[id].y <= (monster.y + 32) &&
            monster.y <= (players[id].y + 32)
        ) {
            socket.emit("catch");
            monsterReady = false;
        }
    }
};

socket.on("position", function(data) {
    if (data.id != id) {
        players[data.id] = data.data;
    }
});

socket.on("remove", function(data) {
    delete players[data];
});

socket.on("monster position", function(data) {
    monster = data;
    monsterReady = true;
});

socket.on("update score", function(data) {
    players[data.id].point = data.point;
});

// Draw everything
var render = function() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1000, canvas.height);
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (heroReady) {
        var heightPos = 32;
        for (var key in players) {
            if (players[key]) {
                ctx.drawImage(heroImage, players[key].x, players[key].y);
                ellipse(ctx, players[key].x + 16, players[key].y + 40, 5, 5, players[key].color);

                ctx.fillStyle = players[key].color;
                ctx.font = "18px Helvetica";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText(players[key].name + ": " + players[key].point, 530, heightPos += 20);
            }
        }
    }

    if (monsterReady) {
        ctx.drawImage(monsterImage, monster.x, monster.y);
    }
};

// The main game loop
var main = function() {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
//reset();
main();
