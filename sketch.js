import { mockLandmarks } from './mockLandmarks.js';



const s = ( sketch ) => {
  function drawBalloon(s) {
    s.image(balloon, balloonX, balloonY, 80, 80);
  }

  let balloon;
  let balloonX = 0;
  let balloonY = 300;
  let eiffelTower;
  let currentWeather;
  let mockLandmark;

  sketch.preload = function() {
    eiffelTower = sketch.loadImage("eiffel_tower.jpg");
    balloon = sketch.loadImage("balloon.png",
      (img) => onImageLoadSuccess('balloon.png', img),
      (err) => onImageLoadError('balloon.png', err)
    );
  };
  sketch.setup = function() { 
    sketch.createCanvas(400, 400);
    
    mockLandmark = mockLandmarks[0];
    console.log(`mockLandmark: ${mockLandmark}`);
  };
  sketch.draw = function() {
    currentWeather = mockLandmark.weather;
    console.log("Weather:", currentWeather);
    sketch.background(currentWeather);
    sketch.image(eiffelTower, 0, 0, 200, 200);
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
