require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual keys
const BIN_ID = process.env.BIN_ID;
const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// POST: Increment click count
app.post('/submit', async (req, res) => {
    try {
        // 1. Get current bin data
        const readRes = await axios.get(BASE_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });

        const record = readRes.data.record || {};
        const currentCount = typeof record.click_count === 'number' ? record.click_count : 0;
        const currentTimestamps = Array.isArray(record.timestamps) ? record.timestamps : [];

        // 2. Increment count
        const newCount = currentCount + 1;
        const newTimestamp = new Date().toISOString();
        const newTimestamps = [...currentTimestamps, newTimestamp];
        // 3. Update bin with new count
        const updatedData = {
            ...record,
            click_count: newCount,
            timestamps: newTimestamps
        };

        await axios.put(BASE_URL, updatedData, {
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Versioning': false
            }
        });

        res.json({ message: 'Click count incremented', click_count: newCount, timestamp: newTimestamp });

    } catch (error) {
        console.error('JSONBin error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to increment click count' });
    }
});

// GET: Retrieve current click count
app.get('/click-count', async (req, res) => {
    try {
        const response = await axios.get(BASE_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });

        const record = response.data.record || {};
        res.json({ click_count: record.click_count || 0 });

    } catch (error) {
        console.error('Fetch error:', error.message);
        res.status(500).json({ error: 'Could not fetch click count' });
    }
});

// Fallback route to serve your app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
