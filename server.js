const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/optimize', (req, res) => {
    const locations = req.body.locations;
    // Perform optimization logic here
    const response = {
        route: [0, 1, 2, 0], // Example route
        stats: {
            total_distance: 123.45,
            num_locations: locations.length
        }
    };
    res.json(response);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});