export function fetchWeather(waypoint){
    // fill in some weather API 
    return weatherAPIResponse
}

export function parseWeatherData(weatherAPIResponse){
    const temp = apiResponse?.main?.temp;
    return new Weather({temp});
}

class Weather {
    constructor({temp}){
        this.temp = temp;
    }

    getBackgroundColor(){
        if (this.temp > 80){ 
            return "red";
        } else if (this.temp > 32){
            return "yellow";
        } else if (this.temp <= 32){
            return "purple";}
        else {
            throw new Error(`Unhandled temperature: ${this.temp}`);
        }
    }
}

export const mockWeatherData = {
    "main": {
        "temp": 306.15, //current temperature
        "pressure": 1013,
        "humidity": 44,
        "temp_min": 306.15, //min current temperature in the city
        "temp_max": 306.15 //max current temperature in the city
    }
}
