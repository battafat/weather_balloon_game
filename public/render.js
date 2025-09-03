export class LandmarkRenderer{
    drawLandmark(sketch, landmark, balloonX){
        console.log('drawLandmark called', landmark, balloonX);
        let buffer = 200;
        let imgWidth = 200;
        let imgHeight = sketch.height - 200;

        let screenLeft = balloonX - sketch.width / 2 - buffer;
        let screenRight = balloonX + sketch.width / 2 + buffer;
        let imageLeft = landmark.x;
        let imageRight = landmark.x + imgWidth;
        console.log('landmark.weather:', landmark.weather);
        console.log('screenLeft, screenRight:', screenLeft, screenRight);
        console.log('imageLeft, imageRight:', imageLeft, imageRight);

        if (imageRight > screenLeft && imageLeft < screenRight){
            if (landmark.weather) {
                sketch.push();
                let currentWeather = landmark.weather;
                
                sketch.fill(currentWeather);
                sketch.noStroke();
                console.log(`currentWeather: ${currentWeather}`);
                sketch.text(`${currentWeather} skies`, landmark.x, landmark.y - 20);

                sketch.pop();
            }
            if (landmark.img){
                sketch.image(landmark.img, landmark.x, landmark.y, imgWidth, imgHeight);
                // TODO: Can this be less messy?
                // landmark name text above landmark image
                if (landmark.name) {
                    sketch.push();
                    sketch.fill(100);
                    sketch.textAlign(CENTER);
                    sketch.textSize(16);
                    sketch.text(landmark.name, landmark.x, landmark.y - 10);
                    sketch.pop();
                }
            }else{
                sketch.rect(landmark.x, sketch.height - 200, 200, 200);
            }
            
        }

    }
}