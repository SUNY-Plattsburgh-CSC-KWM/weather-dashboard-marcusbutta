let latitude;
let longitude;
let days;
let unit;

const weatherCodeToIcon = { //object was originally from claude, modified to use material icons instead of emojis
    0: 'sunny',   // Clear sky
    1: 'partly_cloudy_day',   // Mainly clear
    2: 'partly_cloudy_day',   // Partly cloudy
    3: 'cloud',   // Overcast
    45: 'foggy', // Fog
    48: 'foggy', // Depositing rime fog
    51: 'rainy', // Drizzle: Light intensity
    53: 'rainy', // Drizzle: Moderate intensity
    55: 'rainy', // Drizzle: Dense intensity
    56: 'rainy', // Freezing Drizzle: Light intensity
    57: 'rainy', // Freezing Drizzle: Dense intensity
    61: 'rainy', // Rain: Slight intensity
    63: 'rainy', // Rain: Moderate intensity
    65: 'rainy', // Rain: Heavy intensity
    66: 'weather_hail', // Freezing Rain: Light intensity
    67: 'weather_hail', // Freezing Rain: Heavy intensity
    71: 'weather_snowy', // Snow fall: Slight intensity
    73: 'weather_snowy', // Snow fall: Moderate intensity
    75: 'ac_unit',  // Snow fall: Heavy intensity
    77: 'weather_snowy', // Snow grains
    80: 'rainy', // Rain showers: Slight
    81: 'rainy', // Rain showers: Moderate
    82: 'thunderstorm',  // Rain showers: Violent
    85: 'weather_snowy', // Snow showers: Slight
    86: 'weather_snowy', // Snow showers: Heavy
    95: 'thunderstorm',  // Thunderstorm: Slight or moderate
    96: 'thunderstorm',  // Thunderstorm with slight hail
    99: 'thunderstorm'   // Thunderstorm with heavy hail
};

async function getForecast() {
    latitude = document.getElementById("latitude").value;
    longitude = document.getElementById("longitude").value;
    days = document.getElementById("forecast-days").value;
    switch (document.getElementById("unit").innerText) {
        case "F°": unit = "fahrenheit"; break;
        case "C°": unit = "celsius"; break;
    }
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code&hourly=temperature_2m&current=temperature_2m&forecast_days=${days}&timezone=America%2FNew_York&temperature_unit=${unit}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        let forecast = {};
        for (let i = 1; i <= days; i++) {
            let index = 24*i-1;
            let date = data.hourly.time[index].match(/-(\d{2}-\d{2})/)[1]; //regex from claude
            let high = data.hourly.temperature_2m.slice(index-23,index+1).sort().at(-1);
            let low = data.hourly.temperature_2m.slice(index-23,index+1).sort()[0];
            let wmo = data.daily.weather_code[i-1];
            forecast[date] = {"High": high, "Low": low, "WMO": wmo};
        }
        return forecast;
    } catch (error) {
        console.error(`Could not get weather data: ${error}`);
    }
}

async function buildForecast() {
    try {
        const forecast = await getForecast();
        console.log(forecast);
        $("#forecast").empty();
        for (const item in forecast) {
            $("#forecast").append(
                $("<div>")
                    .addClass("square")
                    .append(
                        $("<p>")
                            .text(item)
                            .addClass("forecast-date")
                    )
                    .append(
                        $("<span>")
                            .addClass("material-symbols-outlined")
                            .text(weatherCodeToIcon[forecast[item].WMO])
                    )
                    .append(
                        $("<p>")
                            .text(forecast[item].High)
                            .addClass("forecast-high")
                    )
                    .append(
                        $("<p>")
                            .text(forecast[item].Low)
                            .addClass("forecast-low")
                    )
            );
        }
    } catch (error) {
        console.log("Error: " + error);
    }
}

function changeUnit() {
    unit = document.getElementById("unit");
    if (unit.innerText === "C°") {
        unit.innerText = "F°";
    } else {
        unit.innerText = "C°";
    }
}