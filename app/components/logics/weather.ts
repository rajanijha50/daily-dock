const OPEN_WEATHER_API = process.env.NEXT_PUBLIC_WEATHER;
// const WEATHER_BIT_API = import.meta.env.VITE_WEATHERBIT_API;


export async function getLocationFromIPInfo() {
    try {
        const response = await fetch("https://ipinfo.io/json");
        const data = await response.json();
        // console.log(data)
        return data
    } catch (error) {
        console.warn("IPInfo geolocation error:", error);
    }
};


export async function getCurrentOpenWeather(lat: string, lon: string) {
    if (lat && lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API}`
                // `https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid=${OPEN_WEATHER_API}`
            );
            const data = await response.json();
            return data
        } catch (error) {
            console.warn("OpenWeatherMap error:", error);
        }
    }
}
export async function getCurrentOpenWeather2() {
    var lat: number | undefined, lon: number | undefined;

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };

    function success(pos: any) {
        const crd = pos.coords;
        lat = crd.latitude;
        lon = crd.longitude;
    }

    function error(err: any) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);

    setTimeout(async function () {
        if (lat && lon) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API}`
                );
                const data = await response.json();
                console.log(data); // Do something with the data here
            } catch (error) {
                console.warn("OpenWeatherMap error:", error);
            }
        }
    }, 5000);
}

export async function getCurrentGoogleMap(lat: string, lon: string) {
    const res = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.NEXT_PUBLIC_GMAP_API_KEY}&location.latitude=${lat}&location.longitude=${lon}`)
    const data = await res.json();
    console.log("from google: ", data)
    // return data
}
