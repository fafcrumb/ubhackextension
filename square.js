var canvas;
var ctx;

var viewportWidth = $(document).width();
var viewportHeight = $(document).height();

var myPlayer;
var players = [];

class Player {
  constructor(name, color) {
    this.name = name;
    this.color = color;

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

var portals = [];

function highlightLinks() {
  var listoflinks = document.getElementsByTagName("A");

  for(var i = 0; i < listoflinks.length ; i++){

  linkBounds = listoflinks[i].getBoundingClientRect();

    var div = jQuery('<div>').css({
      "position":"absolute",
      "height":listoflinks[i].offsetHeight,
      "width":listoflinks[i].offsetWidth,
      "margin-left":linkBounds.left,
      "margin-top":linkBounds.top + jQuery(document).scrollTop(),
      "border":"solid 1px",
    })
    jQuery('#gameCanvas').prepend(div)
  }
}

(function init() {
  canvas = document.createElement('canvas');
  canvas.id = "gameCanvas";
  ctx = canvas.getContext("2d");
  canvas.width = viewportWidth;
  canvas.height = viewportHeight;

  myPlayer = new Player('brian', 'blue');
  players.push(myPlayer);

  highlightLinks();

  $("body").append(canvas);
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
  if (keys[37]) {
    if (myPlayer.xVel > -myPlayer.speed) {
      myPlayer.xVel--;
    }
  }
  if (keys[39]) {
    if (myPlayer.xVel < myPlayer.speed) {
      myPlayer.xVel++;
    }
  }
  if (keys[38]) {
    if (myPlayer.yVel > -myPlayer.speed) {
      myPlayer.yVel--;
    }
  }
  if (keys[40]) {
    if (myPlayer.yVel < myPlayer.speed) {
      myPlayer.yVel++;
    }
  }
}

function update() {
  players.forEach(function(player) {
    player.update();
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach(function(player) {
    player.render(ctx);
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

jQuery(window).resize(function(){
    console.log("YOU LOSE STOP IT")
});
