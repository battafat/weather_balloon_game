function fetchWeather(){
    // fill in some weather API 
}
function parseWeatherData(){

}
class Weather {
    constructor({temp}){
        this.temp
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

