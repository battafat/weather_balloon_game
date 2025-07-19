let balloon;
let balloonX = 0;
let balloonY = 200;

function setup() {
  createCanvas(400, 400);
  balloon = loadImage("balloon.png", 
    (img) => onImageLoadSuccess('balloon.png', img), 
    (err) => onImageLoadError('balloon.png', err)
  );
}

function draw() {
  background(0);
  drawBalloon();
}

function drawBalloon() {
  image(balloon, balloonX, balloonY, 80, 80);
}

//image success tests
function onImageLoadSuccess(name, image) {
  console.log(`Loaded image: ${name}, size: ${image.width}x${image.height}`);
}
function onImageLoadError(name, err) {
  console.error(`Error loading image ${name}`, err);
}
