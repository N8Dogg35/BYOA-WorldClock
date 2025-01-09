const cities = [
    { 
        name: 'la', 
        timezone: 'America/Los_Angeles', 
        coords: { lat: 34.0522, lon: -118.2437 },
        utcOffset: -7,
        timezoneName: 'Pacific Time'
    },
    { 
        name: 'denver', 
        timezone: 'America/Denver', 
        coords: { lat: 39.7392, lon: -104.9903 },
        utcOffset: -6,
        timezoneName: 'Mountain Time'
    },
    { 
        name: 'chicago', 
        timezone: 'America/Chicago', 
        coords: { lat: 41.8781, lon: -87.6298 },
        utcOffset: -5,
        timezoneName: 'Central Time'
    },
    { 
        name: 'columbia', 
        timezone: 'America/New_York', 
        coords: { lat: 34.0007, lon: -81.0348 },
        utcOffset: -4,
        timezoneName: 'Eastern Time'
    },
    { 
        name: 'london', 
        timezone: 'Europe/London', 
        coords: { lat: 51.5074, lon: -0.1278 },
        utcOffset: 1,
        timezoneName: 'British Time'
    },
    { 
        name: 'telaviv', 
        timezone: 'Asia/Jerusalem', 
        coords: { lat: 32.0853, lon: 34.7818 },
        utcOffset: 3,
        timezoneName: 'Israel Time'
    }
].sort((a, b) => a.utcOffset - b.utcOffset);

// Your OpenWeatherMap API key - replace with your actual key
const API_KEY = 'f26d1986a2c729af3eb7b2ce28c83838';

function updateTime() {
    cities.forEach(city => {
        const timeElement = document.getElementById(`${city.name}-time`);
        const timezoneElement = document.getElementById(`${city.name}-timezone`);
        
        // Update time without seconds
        const time = new Date().toLocaleTimeString('en-US', {
            timeZone: city.timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Get timezone name and format UTC offset
        const utcString = city.utcOffset >= 0 ? `+${city.utcOffset}` : city.utcOffset;
        timezoneElement.textContent = `${city.timezoneName} (UTC${utcString})`;
        
        timeElement.textContent = time;
    });
}

async function updateTemperature() {
    for (const city of cities) {
        const tempElement = document.getElementById(`${city.name}-temp`);
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${city.coords.lat}&lon=${city.coords.lon}&appid=${API_KEY}&units=metric`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.main && typeof data.main.temp === 'number') {
                const celsius = Math.round(data.main.temp);
                const fahrenheit = Math.round(celsius * 9/5 + 32);
                tempElement.textContent = `${fahrenheit}°F / ${celsius}°C`;
                
                // Remove any existing temperature range classes
                tempElement.classList.remove(
                    'temp-below-0',
                    'temp-0-31',
                    'temp-32-50',
                    'temp-51-70',
                    'temp-71-90',
                    'temp-above-90'
                );

                // Add appropriate temperature range class
                if (fahrenheit < 0) {
                    tempElement.classList.add('temp-below-0');
                } else if (fahrenheit <= 31) {
                    tempElement.classList.add('temp-0-31');
                } else if (fahrenheit <= 50) {
                    tempElement.classList.add('temp-32-50');
                } else if (fahrenheit <= 70) {
                    tempElement.classList.add('temp-51-70');
                } else if (fahrenheit <= 90) {
                    tempElement.classList.add('temp-71-90');
                } else {
                    tempElement.classList.add('temp-above-90');
                }
            } else {
                tempElement.textContent = 'Temperature unavailable';
            }
        } catch (error) {
            console.error(`Error fetching temperature for ${city.name}:`, error);
            tempElement.textContent = 'Temperature unavailable';
        }
    }
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial call

// Update temperature every 5 minutes
updateTemperature();
setInterval(updateTemperature, 5 * 60 * 1000); 