const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');  // Import the cors package
const app = express();
const port = 3000;

// Middleware setup
app.use(express.json());
app.use(cors());  // Enable CORS for all origins

app.post('/optimize', (req, res) => {
    const locations = req.body.locations;

    // Validate the input
    if (!Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ error: 'Invalid input: locations should be a non-empty array.' });
    }

    // Convert locations to JSON string for Python script
    const locationsJson = JSON.stringify(locations);

    // Call the Python script
    exec(`python delivery_optimizer.py '${locationsJson}'`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (e) {
            console.error(`Error parsing Python script output: ${e.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
