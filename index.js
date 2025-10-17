// index.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import polyline from "@mapbox/polyline";

// Load .env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ✅ Serve static files (e.g., index.html, sketch.js)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Helper function to call Google Routes API
async function getRoutePolyline(origin, destination, apiKey) {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

    const body = {
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        polylineQuality: "OVERVIEW",
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        throw new Error("No routes found");
    }

    return data.routes[0].polyline.encodedPolyline;
}

// ✅ Existing /places endpoint
app.get("/places", async (req, res) => {
    const query = req.query.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            res.json({ place_id: data.results[0].place_id });
        } else {
            res.status(404).json({ error: "No places found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch place ID" });
    }
});

// ✅ /route endpoint — returns encoded + decoded polyline
app.get("/route", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    try {
        const encoded = await getRoutePolyline(origin, destination, process.env.GOOGLE_PLACES_API_KEY);
        const decoded = polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));

        res.json({ encodedPolyline: encoded, decodedPolyline: decoded });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong computing the route" });
    }
});

// ✅ NEW: /places-along-route — get sampled places along route
app.get("/places-along-route", async (req, res) => {
    try {
        const origin = "Omaha,NE";
        const destination = "Chicago,IL";
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        // 1️⃣ Get route polyline and decode
        const encoded = await getRoutePolyline(origin, destination, apiKey);
        const decoded = polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));

        // 2️⃣ Sample 10 points along the route
        const numSamples = 10;
        const step = Math.floor(decoded.length / numSamples);
        const sampledPoints = Array.from({ length: numSamples }, (_, i) => decoded[i * step]);

        // 3️⃣ Fetch nearby landmarks for each sampled point
        const placeResults = [];
        for (const { lat, lng } of sampledPoints) {
            const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&key=${apiKey}`;
            const response = await fetch(placesUrl);
            const data = await response.json();

            if (data.results?.[0]) {
                placeResults.push({
                    name: data.results[0].name,
                    place_id: data.results[0].place_id,
                    location: data.results[0].geometry.location,
                });
            }
        }

        // 4️⃣ Return all sampled places
        res.json({ places: placeResults });
    } catch (error) {
        console.error("Error fetching places along route:", error);
        res.status(500).json({ error: "Failed to fetch places along route" });
    }
});

app.get("/weather", async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Missing lat or lng query parameters" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // ✅ Handle structure correctly:
        const forecastHours = data?.details?.forecastHours;

        if (!forecastHours || forecastHours.length === 0) {
            return res.status(404).json({ error: "No weather data found", details: data });
        }

        // ✅ Return only the useful portion
        res.json({
            forecastHours,
            source: "Google Weather API",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});



// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
