
function getPlaceID(){
    
}

function fetchRoute(origin, destination){
// call the route API
}
function parseRouteResponse(){
// parse the response to fetchRouteData into a list of Waypoint objects.
// what is the format that I want the data to come back in?
// I want lat, lon for 10 locations
// startPoint
// endPoint
let routeData = []; // list of Waypoint objects.
return routeData
}

export class Waypoint {
    constructor({ lat, lon, time }) {
        this.lat = lat;
        this.lon = lon;
        this.time = time ? new Date(time) : new Date();
    }

    setTime(newTime){
        this.time = new Date(newTime);
    }
}

export const mockRoute = [
    //Eiffel Tower
    new Waypoint({
        lat: 48.8584,
        lon: 2.2945,
    }),
    //Arc de triomphe
    new Waypoint({
        lat: 48.8738,
        lon: 2.2950,
    }),
    //Notre Dame Cathedral
    new Waypoint({
        lat: 41.7002,
        lon: 86.2379
    })
]

