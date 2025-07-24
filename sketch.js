import { mockLandmarks } from './landmark.js';


const s = ( sketch ) => {
  function drawBalloon(s) {
    s.image(balloon, balloonX, balloonY, 80, 80);
  }

  let balloon;
  let balloonX = 0;
  let balloonY = 0;
  let eiffelTower;
  let currentWeather;
  let mockLandmark;

  sketch.preload = function() {
    eiffelTower = sketch.loadImage("assets/eiffel_tower.jpg",
      (img) => onImageLoadSuccess('eiffel_tower.png', img),
      (err) => onImageLoadError('eiffel_tower.png', err)
    );
    balloon = sketch.loadImage("assets/balloon.png",
      (img) => onImageLoadSuccess('balloon.png', img),
      (err) => onImageLoadError('balloon.png', err)
    );
  };
  sketch.setup = function() { 
    sketch.createCanvas(400, 400);
    
    mockLandmark = mockLandmarks[0];
    console.log(`mockLandmark: ${mockLandmark.name}`);
  };
  sketch.draw = function() {
    currentWeather = mockLandmark.weather;
    console.log("Weather:", currentWeather);
    sketch.background(currentWeather);
    sketch.image(eiffelTower, 200, 200, 200, 200);
    drawBalloon(sketch);
  }

}

//image success tests
function onImageLoadSuccess(name, image) {
  console.log(`Loaded image: ${name}, size: ${image.width}x${image.height}`);
}
function onImageLoadError(name, err) {
  console.error(`Error loading image ${name}`, err);
}

new p5(s);
