let latitude;
let longitude;
let days;
let unit;

function getForecast() {
    latitude = document.getElementById("latitude").value;
    longitude = document.getElementById("longitude").value;
    days = document.getElementById("forecast-days").value;
    console.log(latitude);
    console.log(longitude);
    console.log(days);
}

function changeUnit() {
    unit = document.getElementById("unit");
    if (unit.innerText === "C°") {
        unit.innerText = "F°";
    } else {
        unit.innerText = "C°";
    }
}