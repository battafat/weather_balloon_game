import { generateLandmarks, mockUpdateWeather } from './landmark.js';
import { mockRoute } from './route.js';
import { LandmarkRenderer } from './render.js';

const s = ( sketch ) => {
  function drawBalloon() {
    sketch.image(balloon, balloonX, balloonY, 80, 80);
  }

  let balloon;
  let balloonX = 0;
  let balloonY = 0;
  let speed = 40;
  let landmarkRenderer;
  let eiffelTower;
  let arcDeTriomphe;
  let notreDame;
  let sketchHeight;
  
  console.log('sketchHeight: ', sketchHeight);
  // let currentWeather;
  // let mockLandmark;
  let assetsToLoad = [
    'balloon.png',
    'eiffel_tower.jpg',
    'arc_de_triomphe.jpg',
    'notre_dame_cathedral.jpg',
  ];
  let preloadedImages = {};
  let landmarks = [];
  // let origin;
  // let destination;
  let mockRouteData = mockRoute;
  // let rawRouteData;
  // let routeData;

  function loadMockImageAssets(sketch, assetNames) {
    let imageStore = {};
    for (let asset of assetNames){
      let assetPath = `assets/${asset}`;
      sketch.loadImage(
        assetPath,
      (img) => {
        onImageLoadSuccess(`${asset}`, img);
        imageStore[asset] = img;
    },
      (err) => onImageLoadError(`${asset}`, err)
  );
    console.log(`imageStore: ${imageStore}`);
    return imageStore;
  }
  }
  
  sketch.preload = function() {
    // preloadedImages = loadMockImageAssets(sketch, assetsToLoad);
    // balloon = preloadedImages['balloon.png'];
    balloon = sketch.loadImage('assets/balloon.png');
    eiffelTower = sketch.loadImage('assets/eiffel_tower.jpg'); // note .jpg fix
    arcDeTriomphe = sketch.loadImage('assets/arc_de_triomphe.jpg');
    notreDame = sketch.loadImage('assets/notre_dame_cathedral.jpg');
  };

  sketch.setup = function() { 
    landmarkRenderer = new LandmarkRenderer();
    sketch.createCanvas(400, 400);
    sketchHeight = sketch.height;
    //  rawRouteData = fetchRoute(origin, destination); // for real data
    // parsedRouteData = parseRouteResponse(rawRouteData);
    // pass mockRouteData until real API calls implemented
    landmarks = generateLandmarks(mockRouteData, sketchHeight/2);
    console.log('landmarks:', landmarks);
    for (let i = 0; i < landmarks.length; i++){
      mockUpdateWeather(landmarks[i]);
      // setImage(lm); // this will be used when real data is used
      // landmarks[i].img = preloadedImages[i]; // I think it will make sense to load the images
      landmarks[i].img = [eiffelTower, arcDeTriomphe, notreDame][i];
    }
    console.log('landmarks with weather updated:', landmarks);
    // console.log(`mockLandmark: ${mockLandmark.name}`);
  };
  
  sketch.draw = function() {
    // currentWeather = mockLandmark.weather;
    // console.log("Weather:", currentWeather);
    // sketch.background(currentWeather);
    // sketch.image(eiffelTower, 200, 200, 200, 200);
    // sketch.image(arcDeTriomphe, 200, 200, 200, 200);
    // sketch.image(notreDame, 200, 200, 200, 200);
    // push();
    sketch.background(220);
    sketch.translate(-balloonX + 100, 0);
    // console.log('draw running');
    for (let lm of landmarks){
      // console.log('Calling drawLandmark for:', lm);
      landmarkRenderer.drawLandmark(sketch, lm, balloonX);
      // landmarkRenderer.drawWeather(sketch, lm);
    }
    drawBalloon(sketch);
    // pop();
  }
  sketch.keyPressed = () => {
    switch (sketch.keyCode) {
      case sketch.RIGHT_ARROW:
        balloonX += speed;
        break;
      case sketch.LEFT_ARROW:
        balloonX -= speed;
        break;
      case sketch.UP_ARROW:
        balloonY -= speed;
        break;
      case sketch.DOWN_ARROW:
        balloonY += speed;
        break;
      }
  };
}

//image success tests
function onImageLoadSuccess(name, image) {
  console.log(`Loaded image: ${name}, size: ${image.width}x${image.height}`);
}
function onImageLoadError(name, err) {
  console.error(`Error loading image ${name}`, err);
}

new p5(s);
