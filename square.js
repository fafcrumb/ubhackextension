var canvas;
var ctx;
var socket;

var viewportWidth = $(document).width();
var viewportHeight = $(document).height();

var myPlayer;
var otherPlayer;

var players = [];

var submitButton = $("#submit");
var status = $("#status")
var nameListArea = $("#name_list_area");
var nameStartUp = $("#name_start_up");
var nameList = $("#nameList");
nameListArea.hide();

class Player {
  constructor(name, color) {
    this.name = name;
    this.color = color;

    this.uuid = '';

    this.xPos = 0;
    this.yPos = 0;
    this.xVel = 0;
    this.yVel = 0;

    this.speed = 2;
    this.friction = 0.98;

    this.size = 35;

    this.role = '';
    this.score = '';
  }

  update() {
    this.yVel *= this.friction;
    this.yPos += this.yVel;
    this.xVel *= this.friction;
    this.xPos += this.xVel;

    if (this.xPos >= viewportWidth - this.size) {
        this.xPos = viewportWidth - this.size;
    } else if (this.xPos <= this.size) {
        this.xPos = this.size;
    }

    if (this.yPos > viewportHeight - this.size) {
        this.yPos = viewportHeight - this.size;
    } else if (this.yPos <= this.size) {
        this.yPos = this.size;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Portal {
  constructor(xPos, yPos, width, height, url) {
    this.width = width;
    this.height = height;

    this.xPos = xPos;
    this.yPos = yPos;

    this.url = url;
  }

  render(ctx) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.rect(this.xPos, this.yPos, this.width, this.height);
    ctx.stroke();
  }
}

var portals = [];

function highlightLinks() {
  var listoflinks = document.getElementsByTagName("A");

  for(var i = 0; i < listoflinks.length ; i++){
    linkBounds = listoflinks[i].getBoundingClientRect();

    var width = listoflinks[i].offsetWidth;
    var height = listoflinks[i].offsetHeight;
    var x = linkBounds.left;
    var y = linkBounds.top + jQuery(document).scrollTop();
    var url = listoflinks[i].href;

    portals.push(new Portal(x, y, width, height, url));
  }

}

(function init() {
  socket = io.connect("ws://128.205.27.232:4004/");
  canvas = document.createElement('canvas');
  canvas.id = "gameCanvas";
  ctx = canvas.getContext("2d");
  canvas.width = viewportWidth;
  canvas.height = viewportHeight;
  $("body").append(canvas);

  myPlayer = new Player('brian', 'blue');

  highlightLinks();
})();

var gameOn = true;

function run() {
  input();
  update();
  render();

  setTimeout(run, 10);
}

var keys = [];

function input() {
  if (keys[37]) { //left
    if (myPlayer.xVel > -myPlayer.speed) {
      myPlayer.xVel--;
    }
  }
  if (keys[39]) { //right
    if (myPlayer.xVel < myPlayer.speed) {
      myPlayer.xVel++;
    }
  }
  if (keys[38]) { //up
    if (myPlayer.yVel > -myPlayer.speed) {
      myPlayer.yVel--;
    }
  }
  if (keys[40]) { //down
    if (myPlayer.yVel < myPlayer.speed) {
      myPlayer.yVel++;
    }
  }

  socket.emit("playerInfo", JSON.stringify({
    "action" : "direction",
    "up_press" : keys[38],
    "down_press" : keys[40],
    "left_press" : keys[37],
    "right_press" : keys[39]
  }));
}

function update() {
  myPlayer.update();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  myPlayer.render(ctx);

  portals.forEach(function(portal) {
    portal.render(ctx);
  });
}

run();

document.body.addEventListener("keydown", function(e) {
  e.preventDefault();
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
  e.preventDefault();
  keys[e.keyCode] = false;
});

socket.on('onconnected', function( data ) {
    console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});

function requestPlay() {

  // players[0].uuid
}

socket.on('playerInfo', function(data) {
  console.log( 'data recieved: ' + data );
  var rJson = JSON.parse(data);
  console.log(data);
  switch(rJson.action) {
    case "create_player":
      myPlayer.uuid = rJson.uuid;
      break;
    case "in_lobby":
      if(rJson.players != null) {
        nameListArea.show();
        players = [];
        JSON.parse(rJson.players).forEach(function(item,index) {
          var temp = $("<li class='list-group-item'>").html(item[Object.keys(item)[0]]);
          nameList.append(temp);
          players.push(item);
        });
      }
      break;
  }
});

submitButton.click(function() {
  player.name=$("#name_input").val();
  socket.emit("playerInfo", JSON.stringify({
    "action" : "create_player",
    "name" : player.name,
    "uuid" : player.uuid
  }));
  $("#name_area").text(player.name);
  console.log(player.name);
  nameStartUp.hide();
  socket.emit("playerInfo",JSON.stringify({
    "action" : "in_lobby"
    }));
});

jQuery(window).resize(function(){
    console.log("YOU LOSE STOP IT")
});
