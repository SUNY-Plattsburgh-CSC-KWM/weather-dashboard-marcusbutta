let latitude;
let longitude;
let days;
let unit;
let startDate;
let endDate;
let temperatureCheck;
let dewpointCheck;
let windspeedCheck;

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

async function getHistory() {
    latitude = document.getElementById("latitude").value;
    longitude = document.getElementById("longitude").value;
    startDate = document.getElementById("start-date").value;
    endDate = document.getElementById("end-date").value;
    switch (document.getElementById("unit").innerText) {
        case "F°": unit = "fahrenheit"; break;
        case "C°": unit = "celsius"; break;
    }

    if (document.getElementById("temperature").checked === true) {
        temperatureCheck = "temperature_2m,";
    } else { temperatureCheck = ""; }
    if (document.getElementById("dewpoint").checked === true) {
        dewpointCheck = "dewpoint_2m,";
    } else { dewpointCheck = ""; }
    if (document.getElementById("windspeed").checked === true) {
        windspeedCheck = "windspeed_10m,";
    } else { windspeedCheck = ""; }

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${temperatureCheck}${dewpointCheck}${windspeedCheck}&start_date=${startDate}&end_date=${endDate}&timezone=America%2FNew_York&temperature_unit=${unit}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        let history = { date: [], temperature: [], dewpoint: [], windspeed: [] };
        for (let i = 0; i < data.hourly.time.length/24; i++) {
            history.date.push(data.hourly.time[i*24].match(/-(\d{2}-\d{2})/)[1]);
            if (temperatureCheck === "temperature_2m,") {
                history.temperature.push((data.hourly.temperature_2m.slice(i,i+24).reduce((a, b) => a + b) / 24).toFixed(1)); // used claude to help with averaging and rounding
            }
            if (dewpointCheck === "dewpoint_2m,") {
                history.dewpoint.push((data.hourly.dewpoint_2m.slice(i,i+24).reduce((a, b) => a + b) / 24).toFixed(1));
            }
            if (windspeedCheck === "windspeed_10m,") {
                history.windspeed.push((data.hourly.windspeed_10m.slice(i,i+24).reduce((a, b) => a + b) / 24).toFixed(1));
            }
        }
        return history;
    } catch (error) {
        console.error(`Could not get weather data: ${error}`);
    }
}

async function buildHistory() {
    try {
        const history = await getHistory();
        console.log(history);

        $("#history").empty();
        $("#history").append($("<canvas>").attr("id", "historyChart"));
        $("#history")
            .css("background", "#363a4f")
            .css("border", "3px solid #6e738d");

        const ctx = document.getElementById("historyChart");

        Chart.defaults.color = '#cad3f5';
        Chart.defaults.borderColor = '#8087a2';
        Chart.defaults.backgroundColor = '#363a4f';
        Chart.defaults.font.family = "Inter";
        Chart.defaults.font.size = 14;
        Chart.defaults.font.weight = 400;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: history.date,
                datasets: [
                    {
                        yAxisID: "temp",
                        label: "Temperature",
                        data: history.temperature,
                        fill: false,
                        borderColor: "#ed8796",
                        tension: 0.5,
                    },
                    {
                        yAxisID: "dew",
                        label: "Dewpoint",
                        data: history.dewpoint,
                        fill: false,
                        borderColor: "#a6da95",
                        tension: 0.5,
                    },
                    {
                        yAxisID: "wind",
                        label: "Windspeed",
                        data: history.windspeed,
                        fill: false,
                        borderColor: "#7dc4e4",
                        tension: 0.5,
                    }
                ]
            },
            options: { // Got help from https://www.geeksforgeeks.org/javascript/how-to-use-two-y-axes-in-chart-js/
                responsive: true,
                scales: {
                    temp: {
                        title: {
                            display: true,
                            text: "Temperature",
                        },
                        type: 'linear',
                        position: 'left',
                        ticks:
                            {
                                beginAtZero: true,
                                color: '#ed8796'
                            },
                        grid: { display: false },
                    },
                    dew: {
                        title: {
                            display: true,
                            text: "Dewpoint",
                        },
                        type: 'linear',
                        position: 'left',
                        ticks:
                            {
                                beginAtZero: true,
                                color: '#a6da95'
                            },
                        grid: { display: false }
                    },
                    wind: {
                        title: {
                            display: true,
                            text: "Windspeed",
                        },
                        type: 'linear',
                        position: 'left',
                        ticks:
                            {
                                beginAtZero: true,
                                color: '#7dc4e4'
                            },
                        grid: { display: false }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Date",
                            font: {
                                weight: 700,
                                size: 16,
                            }
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                }
            }
        })
    } catch(error) {
        console.error("Error: " + error);
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