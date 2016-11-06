var canvas;
var ctx;

var viewportWidth = $(document).width();
var viewportHeight = $(document).height();

var myPlayer;
var otherPlayer;

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
    this.friction = 0.8;

    this.size = 40;

    this.role = '';
    this.score = '';
    this.img = new Image();
    this.img.src = chrome.extension.getURL("assets/blackspider.png");
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
    ctx.drawImage(this.img, this.xPos-this.size/2, this.yPos-this.size/2, this.size, this.size);
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
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-West.png");
    if (myPlayer.xVel > -myPlayer.speed) {
      myPlayer.xVel--;
    }
  }
  if (keys[39]) { //right
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-East.png");
    if (myPlayer.xVel < myPlayer.speed) {
      myPlayer.xVel++;
    }
  }
  if (keys[38]) { //up
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-North.png");
    if (myPlayer.yVel > -myPlayer.speed) {
      myPlayer.yVel--;
    }
  }
  if (keys[40]) { //down
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-South.png");
    if (myPlayer.yVel < myPlayer.speed) {
      myPlayer.yVel++;
    }
  }
  if(keys[37] && keys[38]){
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-NW.png");
  }
  if(keys[38] && keys[39]){
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-NE.png");
  }
  if(keys[39] && keys[40]){
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-SE.png");
  }
  if(keys[40] && keys[37]){
    myPlayer.img.src = chrome.extension.getURL("assets/blackspider-SW.png");
  }

  console.log(keys[38]);

  chrome.runtime.sendMessage({"action" : "direction",
                              "up_press" : keys[38] || false, "down_press" : keys[40] || false,
                              "left_press" : keys[37] || false, "right_press" :  keys[39] || false});
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

$(window).resize(function(){
    console.log("YOU LOSE STOP IT")
});
