import { mockRoute, Waypoint } from "./route.js";


export class Landmark {
    constructor({ name, lat, lon, img, imgUrl, weather, x, y, time }) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.lat = lat;
        this.lon = lon;
        this.imgUrl = imgUrl;
        this.img = img;
        this.time = time;
        this.weather = weather;
    }

    // generateLandmarks(routeSteps) {
    //     let landmarks = [];
    //     for (let i = 0; i < routeSteps.length; i++) {
    //         landmarks.push(new Landmark({
    //             lat: routeSteps[i][0],
    //             lon: routeSteps[i][1]
    //         }
    //         ));
    //     };
    //     return landmarks;
    // }

}

// export const mockLandmarks = [
//     new Landmark({
//         name: "eiffel tower", 
//         x: 0,
//         y: 0,
//         lat: 48.8584,
//         lon: 2.2945,
//         img: "eiffel_tower.jpg",
//         weather: "yellow",
//     })
// ]
// export const mockLandmarks = generateLandmarks(mockRoute);

// takes a list of Waypoint obects.
// parses each of those Waypoints to define the lat, lon, and time variables. 
export function generateLandmarks(routeData, sketchHeight){
    let landmarks = [];
    for (let i = 0; i < routeData.length; i++){
        let waypoint = routeData[i];
        let landmark = new Landmark({
            lat: waypoint.lat, 
            lon: waypoint.lon,
            x: 400 + i * 700,
            y: sketchHeight,
            time: waypoint.time
        })
        landmarks.push(landmark);
    }
    return landmarks;
}

// export function defineWeather(landmarks, weatherData){
//     for (let lm of landmarks){
//         lm.updateWeather(lm);
//     }
// }

function landmarkIsVisible(){
// TODO: might be worth having this at some point
}

function updateWeather(landmark){
    let rawWeatherData = landmark.fetchWeather(landmark);
    let parsedData = landmark.parseWeatherData(rawWeatherData);
    // parsedData should be a Waypoint object. 
    landmark.weather = parsedData;
}
export function mockUpdateWeather(landmark){
//     let weatherMockData = [
//         "blue",
//         "red",
//         "green"
// ]
    landmark.weather = "blue";
}

function setImage(sketch, landmark){
    if (!landmark.img && landmark.imgUrl) {
        sketch.loadImage(landmark.imgUrl, (img) => {
            landmark.img = img;
        });
    }
}

// export const weatherConditions = [{
//     sunny: "yellow",
//     cloudy: "grey",
//     }
// ]
// constructor({name, lat, lon, img, weather, x, y}){
// this.name = name;
// this.x = x;
// this.y = y;
// this.lat = lat;
// this.lon = lon;
// this.img = img;
// this.weather = weather;
//     }