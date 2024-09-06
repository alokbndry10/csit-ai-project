$(document).ready(function() {
    const width = 800;
    const height = 600;

    let locations = [
        { id: 0, x: 27.7172, y: 85.3240, type: "depot" }  // Initial depot location set to Kathmandu
    ];

    var map;

    function initMap() {
        // Initialize the Leaflet map
        map = L.map('map').setView([27.7172, 85.3240], 4); // Initial map centered at Kathmandu

        // Use OpenStreetMap tiles for free map data
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    function renderMap() {
        // Clear any previous markers on the map
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Extend the map view to fit all markers
        var bounds = new L.LatLngBounds();

        // Add new markers for each location
        locations.forEach(function(location) {
            var marker = L.marker([location.x, location.y]).addTo(map)
                .bindPopup('Location: ' + location.x + ',' + location.y);
            bounds.extend(marker.getLatLng());
        });

        // Fit the map bounds to the markers
        if (locations.length > 1) {
            map.fitBounds(bounds);
        }
    }

    function addRandomLocation() {
        // Generate a random location (latitude and longitude within valid ranges)
        const newLocation = {
            id: locations.length,
            x: Math.random() * 180 - 90,  // Latitude range [-90, 90]
            y: Math.random() * 360 - 180, // Longitude range [-180, 180]
            type: "delivery"
        };
        locations.push(newLocation);
        renderMap();
    }

    $("#add-location").click(addRandomLocation);

    $("#optimize").click(function() {
        $(".loading").show();
        $.ajax({
            url: "http://localhost:3000/optimize",  // Ensure this URL is correct
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ locations: locations }),
            success: function(response) {
                drawRoute(response.route);
                updateStats(response.stats);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error optimizing route:", textStatus, errorThrown);
                alert("An error occurred while optimizing the route. Check the console for more details.");
            },
            complete: function() {
                $(".loading").hide();
            }
        });
    });

    $("#reset").click(function() {
        locations = [locations[0]];  // Keep only the depot
        renderMap();
        $("#stats").empty();
    });

    function drawRoute(route) {
        // Optionally, implement route drawing logic here if needed.
        // This would involve drawing lines between points using Leaflet's polyline feature.
        if (route && route.length > 1) {
            const routeCoords = route.map(id => [locations[id].x, locations[id].y]);
            L.polyline(routeCoords, { color: 'blue' }).addTo(map);
        }
    }

    function updateStats(stats) {
        $("#stats").html(`
            <h3>Route Statistics</h3>
            <p>Total Distance: ${stats.total_distance.toFixed(2)}</p>
            <p>Number of Locations: ${stats.num_locations}</p>
        `);
    }

    // Initialize the map when the document is ready
    initMap();
});