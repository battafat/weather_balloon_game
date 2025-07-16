let balloon;
let balloonX = 0;
let balloonY = 200;

function setup() {
  createCanvas(400, 400);
  balloon = loadImage("balloon.png");
}

function draw() {
  background(0);
  drawBalloon();
}

function drawBalloon() {
  image(balloon, balloonX, balloonY, 80, 80);
}

