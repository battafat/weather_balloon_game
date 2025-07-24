class Landmark {
    constructor({ name, lat, lon, img, weather, x, y }) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.lat = lat;
        this.lon = lon;
        this.img = img;
        this.weather = weather;
    }

    generateLandmarks(routeSteps) {
        let landmarks = [];
        for (let i = 0; i < routeSteps.length; i++) {
            landmarks.push(new Landmark({
                lat: routeSteps[i][0],
                lon: routeSteps[i][1]
            }
            ));
        };
        return landmarks;
    }

}

export const mockLandmarks = [
    new Landmark({
        name: "eiffel tower", 
        x: 0,
        y: 0,
        lat: 48.8584,
        lon: 2.2945,
        img: "eiffel_tower.jpg",
        weather: "yellow",
    })
]

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