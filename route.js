
function fetchRouteData(){
// 
}
function parseRouteData(){
// parse whatever the data is that comes back from the API into the format
// that I want to use in the sketch. 
// what is the format that I want the data to come back in?
// I want lat, lon for 10 locations
// startPoint
// endPoint
routeSteps = [];
return routeSteps
}



class Landmark {
    constructor(name, lat, lon, img, weather, x, y){
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
            landmarks.push(new Landmark(
                lat = routeSteps[i][0],
                lon = routeSteps[i][1]
            ));
        };
        return landmarks;
    }
}

class Weather {
    constructor(condition){
        this.condition;
    }
}