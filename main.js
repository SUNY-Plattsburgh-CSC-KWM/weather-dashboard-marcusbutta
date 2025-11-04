let latitude;
let longitude;
let days;
let unit;

async function getForecast() {
    latitude = document.getElementById("latitude").value;
    longitude = document.getElementById("longitude").value;
    days = document.getElementById("forecast-days").value;
    switch (document.getElementById("unit").innerText) {
        case "F°": unit = "fahrenheit"; break;
        case "C°": unit = "celsius"; break;
    }
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m&forecast_days=${days}&temperature_unit=${unit}`);
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
            forecast[date] = {"High": high, "Low": low};
        }
        console.log(forecast);
    } catch (error) {
        console.error(`Could not get weather data: ${error}`);
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