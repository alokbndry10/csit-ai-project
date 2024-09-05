$(document).ready(function() {
    const width = 800;
    const height = 600;

    let locations = [
        { id: 0, x: 0, y: 0, type: "depot" }  // Adjust to lat/lng coordinates
    ];

    var map;

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 0, lng: 0 },
            zoom: 4
        });
    }

    function renderMap() {
        $('#map').html('');  // Clear the map before rendering
        var bounds = new google.maps.LatLngBounds();
        locations.forEach(function(location) {
            var marker = new google.maps.Marker({
                position: { lat: location.x, lng: location.y },
                map: map,
                title: 'Location: ' + location.x + ',' + location.y
            });
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
    }

    function addRandomLocation() {
        const newLocation = {
            id: locations.length,
            x: Math.random() * (180 - (-180)) + (-180), // Latitude range [-180, 180]
            y: Math.random() * (90 - (-90)) + (-90),   // Longitude range [-90, 90]
            type: "delivery"
        };
        locations.push(newLocation);
        renderMap();
    }

    $("#add-location").click(addRandomLocation);

    $("#optimize").click(function() {
        $(".loading").show();
        $.ajax({
            url: "http://localhost:3000/optimize",
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
    }

    function updateStats(stats) {
        $("#stats").html(`
            <h3>Route Statistics</h3>
            <p>Total Distance: ${stats.total_distance.toFixed(2)}</p>
            <p>Number of Locations: ${stats.num_locations}</p>
        `);
    }

    initMap();
});
