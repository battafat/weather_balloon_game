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

// ✅ Endpoint to get the place_id for a user-entered query
app.get("/places", async (req, res) => {
    const query = req.query.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
        );
        const data = await response.json();

        // Extract the place_id from the first result (if any)
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

app.get("/route", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

    const body = {
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        polylineQuality: "OVERVIEW",
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ error: "No routes found" });
        }

        // Extract and decode the polyline
        const encoded = data.routes[0].polyline.encodedPolyline;
        const decoded = polyline.decode(encoded).map(([lat, lng]) => ({
            lat,
            lng,
        }));

        // Send both for clarity
        res.json({
            encodedPolyline: encoded,
            decodedPolyline: decoded,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong computing the route" });
    }
});






// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


