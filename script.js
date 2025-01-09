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
                const weatherIcon = data.weather[0].icon;
                const weatherDescription = data.weather[0].description;
                
                tempElement.innerHTML = `
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDescription}" class="weather-icon">
                    <span>${fahrenheit}°F / ${celsius}°C</span>
                `;
                
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

const detailedCities = {
    pacific: [
        { name: 'Los Angeles', coords: { lat: 34.0522, lon: -118.2437 } },
        { name: 'Seattle', coords: { lat: 47.6062, lon: -122.3321 } }
    ],
    mountain: [
        { name: 'Denver', coords: { lat: 39.7392, lon: -104.9903 } },
        { name: 'Park City', coords: { lat: 40.6461, lon: -111.4980 } },
        { name: 'Phoenix', coords: { lat: 33.4484, lon: -112.0740 } }
    ],
    central: [
        { name: 'Austin', coords: { lat: 30.2672, lon: -97.7431 } },
        { name: 'Chicago', coords: { lat: 41.8781, lon: -87.6298 } },
        { name: 'Minneapolis', coords: { lat: 44.9778, lon: -93.2650 } }
    ],
    eastern: [
        { name: 'New York', coords: { lat: 40.7128, lon: -74.0060 } },
        { name: 'Toronto', coords: { lat: 43.6532, lon: -79.3832 } },
        { name: 'Columbia', coords: { lat: 34.0007, lon: -81.0348 } },
        { name: 'Miami', coords: { lat: 25.7617, lon: -80.1918 } }
    ],
    london: [
        { name: 'London', coords: { lat: 51.5074, lon: -0.1278 } }
    ],
    israel: [
        { name: 'Jerusalem', coords: { lat: 31.7683, lon: 35.2137 } },
        { name: 'Tel Aviv', coords: { lat: 32.0853, lon: 34.7818 } }
    ]
};

async function updateDetailedWeather() {
    for (const [zone, cities] of Object.entries(detailedCities)) {
        // Update the timezone header with current time
        const header = document.querySelector(`[data-zone="${zone}"]`);
        if (header) {
            const time = new Date().toLocaleTimeString('en-US', {
                timeZone: getTimezone(zone),
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const zoneName = getTimezoneName(zone);
            const utcOffset = getUtcOffset(zone);
            header.textContent = `${zoneName} (UTC${utcOffset}) - ${time}`;
        }

        // Update the cities table
        const tbody = document.getElementById(`${zone}-cities`);
        if (!tbody) continue; // Skip if tbody doesn't exist

        tbody.innerHTML = ''; // Clear existing rows

        // Add each city to the table
        for (const city of cities) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.coords.lat}&lon=${city.coords.lon}&appid=${API_KEY}&units=metric`
                );
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                const celsius = Math.round(data.main.temp);
                const fahrenheit = Math.round(celsius * 9/5 + 32);
                
                // Calculate precipitation
                let precipText = window.innerWidth <= 480 ? "no rain/snow" : "None";
                if (data.rain?.['1h'] || data.snow?.['1h']) {
                    const rainMM = data.rain?.['1h'] || 0;
                    const snowMM = data.snow?.['1h'] || 0;
                    const totalInches = ((rainMM + snowMM) / 25.4).toFixed(2);
                    precipText = `${totalInches}"`;
                    
                    if (rainMM > 0 && snowMM > 0) {
                        precipText += " (Rain & Snow)";
                    } else if (rainMM > 0) {
                        precipText += " (Rain)";
                    } else {
                        precipText += " (Snow)";
                    }
                }

                // Create and append the row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${city.name}</td>
                    <td>${fahrenheit}°F / ${celsius}°C</td>
                    <td class="detailed-weather">
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" 
                             alt="${data.weather[0].description}">
                        ${data.weather[0].description}
                    </td>
                    <td>${precipText}</td>
                `;
                tbody.appendChild(row);
            } catch (error) {
                console.error(`Error fetching weather for ${city.name}:`, error);
                // Add error row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${city.name}</td>
                    <td colspan="3">Weather data unavailable</td>
                `;
                tbody.appendChild(row);
            }
        }
    }
}

// Update the time in headers every minute
setInterval(() => {
    document.querySelectorAll('[data-zone]').forEach(header => {
        const zone = header.getAttribute('data-zone');
        const time = new Date().toLocaleTimeString('en-US', {
            timeZone: getTimezone(zone),
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        const zoneName = getTimezoneName(zone);
        const utcOffset = getUtcOffset(zone);
        header.textContent = `${zoneName} (UTC${utcOffset}) - ${time}`;
    });
}, 60000);

// Initial call to populate data
updateDetailedWeather();

// Update weather data every 5 minutes
setInterval(updateDetailedWeather, 5 * 60 * 1000);

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.accordion-icon');
        
        // Toggle active class on button and content
        button.classList.toggle('active');
        content.classList.toggle('active');
        
        // Update icon rotation through active class
        if (button.classList.contains('active')) {
            icon.style.transform = 'rotate(90deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    });
});

// Optional: Open the first accordion by default
document.querySelector('.accordion-header').click(); 

// Add helper functions
function getTimezone(zone) {
    const timezones = {
        pacific: 'America/Los_Angeles',
        mountain: 'America/Denver',
        central: 'America/Chicago',
        eastern: 'America/New_York',
        london: 'Europe/London',
        israel: 'Asia/Jerusalem'
    };
    return timezones[zone];
}

function getTimezoneName(zone) {
    const names = {
        pacific: 'Pacific Time',
        mountain: 'Mountain Time',
        central: 'Central Time',
        eastern: 'Eastern Time',
        london: 'British Time',
        israel: 'Israel Time'
    };
    return names[zone];
}

function getUtcOffset(zone) {
    const offsets = {
        pacific: -7,
        mountain: -6,
        central: -5,
        eastern: -4,
        london: 1,
        israel: 3
    };
    const offset = offsets[zone];
    return offset >= 0 ? `+${offset}` : offset;
} 

// Also add a resize listener to update the text when the window is resized
window.addEventListener('resize', () => {
    const precipCells = document.querySelectorAll('.timezone-group td:nth-child(4)');
    precipCells.forEach(cell => {
        if (cell.textContent.trim() === 'None') {
            cell.textContent = window.innerWidth <= 480 ? 'no rain/snow' : 'None';
        }
    });
}); 