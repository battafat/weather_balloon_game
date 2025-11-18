import express from "express";
import fetch from "node-fetch";
import polyline from "@mapbox/polyline";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});
app.get("/autocomplete", async (req, res) => {
    const { input } = req.query;
    if (!input) return res.status(400).json({ error: "Missing input" });

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        const url = "https://places.googleapis.com/v1/places:autocomplete?key=" + apiKey;

        const body = {
            input,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log("🔹 Google Autocomplete full response:", JSON.stringify(data, null, 2)); // log everything
        res.json(data); // just return everything for testing

    } catch (err) {
        console.error("❌ Autocomplete error:", err);
        res.status(500).json({ error: "Failed to fetch autocomplete" });
    }
});




// ✅ Helper function to call Google Routes API (walking + durations)
async function getWalkingRoute(origin, destination, apiKey) {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

    const body = {
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "WALK",
        computeAlternativeRoutes: false,
        routeModifiers: { avoidTolls: false, avoidHighways: false },
        polylineQuality: "OVERVIEW",
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
                "routes.duration,routes.distanceMeters,routes.legs.steps.startLocation,routes.legs.steps.endLocation,routes.legs.steps.polyline.encodedPolyline,routes.legs.steps.distanceMeters,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.error) {
        console.error("❌ Google Routes API error:", JSON.stringify(data, null, 2));
        throw new Error(data.error.message);
    }

    if (!data.routes || data.routes.length === 0) {
        console.error("❌ No routes found. Full response:", JSON.stringify(data, null, 2));
        throw new Error("No walking route found");
    }

    return data.routes[0];
}

// ✅ Combine all decoded polylines into one long list
function combineAllPolylines(steps) {
    return steps.flatMap((step) => step.decodedPolyline);
}

// ✅ Sample evenly spaced points from the combined polyline
function sampleCoordinates(decodedPolyline, numSamples = 10) {
    if (!Array.isArray(decodedPolyline) || decodedPolyline.length === 0) return [];

    const n = decodedPolyline.length;
    if (n <= numSamples) return decodedPolyline.slice();

    const samples = [decodedPolyline[0]];
    const interiorCount = Math.max(0, numSamples - 2);
    const step = (n - 1) / (interiorCount + 1);

    for (let i = 1; i <= interiorCount; i++) {
        const idx = Math.round(i * step);
        samples.push(decodedPolyline[idx]);
    }

    samples.push(decodedPolyline[n - 1]);
    return samples;
}

// ✅ Use Google Places Text Search API to get a standardized address
async function getFormattedAddress(query, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
        console.warn(`⚠️ No address found for query: ${query}`);
        return query; // fallback: just return original input
    }

    return data.results[0].formatted_address;
}

// ✅ Get a *random unique* nearby photo for one coordinate using Places API
async function getNearbyPhoto(lat, lng, apiKey, usedPhotoRefs = new Set()) {
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=300&key=${apiKey}`;

    const response = await fetch(nearbyUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
        console.warn(`⚠️ No nearby place found for ${lat},${lng}`);
        return null;
    }

    // Filter out places with no photos or already used photo references
    const candidates = data.results.filter(
        (p) =>
            p.photos?.length &&
            !usedPhotoRefs.has(p.photos[0].photo_reference)
    );

    if (candidates.length === 0) {
        console.warn(`⚠️ No new photos found for ${lat},${lng}`);
        return null;
    }

    // Pick a random unused place
    const place = candidates[Math.floor(Math.random() * candidates.length)];
    const photoRef = place.photos[0].photo_reference;
    usedPhotoRefs.add(photoRef);

    const photoUrl = `/photo?ref=${photoRef}`;

    return {
        name: place.name,
        photoUrl,
        location: place.geometry.location,
    };
}

// ✅ /route endpoint — walking mode + step durations + sampled coordinates + nearby photos
app.get("/route", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        const cleanOrigin = await getFormattedAddress(origin, apiKey);
        const cleanDestination = await getFormattedAddress(destination, apiKey);

        console.log("🧭 Cleaned Origin:", cleanOrigin);
        console.log("🧭 Cleaned Destination:", cleanDestination);

        const route = await getWalkingRoute(cleanOrigin, cleanDestination, apiKey);

        const totalDurationSeconds = parseFloat(route.duration.replace("s", "")) || 0;
        const totalDistanceMeters = route.distanceMeters || 1;

        const startTime = Date.now();
        let cumulativeSeconds = 0;

        const stepsWithArrival = route.legs[0].steps.map((step) => {
            const durationSeconds =
                (step.distanceMeters / totalDistanceMeters) * totalDurationSeconds;
            cumulativeSeconds += durationSeconds;
            const arrivalTime = new Date(startTime + cumulativeSeconds * 1000).toISOString();

            const decodedStep = polyline
                .decode(step.polyline.encodedPolyline)
                .map(([lat, lng]) => ({ lat, lng }));

            return {
                start: step.startLocation,
                end: step.endLocation,
                duration: Math.round(durationSeconds),
                distance: step.distanceMeters,
                arrivalTime,
                decodedPolyline: decodedStep,
            };
        });

        const allPoints = combineAllPolylines(stepsWithArrival);
        const sampledPoints = sampleCoordinates(allPoints, 10);

        // ✅ Track used photo references globally for this request
        const usedPhotoRefs = new Set();

        // ✅ Fetch unique nearby photos in parallel
        const nearbyPhotos = await Promise.all(
            sampledPoints.map(async (point) => {
                const photo = await getNearbyPhoto(point.lat, point.lng, apiKey, usedPhotoRefs);
                return { point, photo };
            })
        );

        res.json({
            totalDuration: route.duration,
            totalDistance: route.distanceMeters,
            sampledPoints,
            nearbyPhotos,
        });
    } catch (err) {
        console.error("❌ Error computing walking route:", err);
        res.status(500).json({ error: "Something went wrong computing the walking route" });
    }
});

// ✅ Proxy route to serve Google Place photos and avoid CORS issues
app.get("/photo", async (req, res) => {
    const { ref } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!ref) {
        return res.status(400).send("Missing photo reference");
    }

    try {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${apiKey}`;
        const response = await fetch(photoUrl);

        if (!response.ok) {
            throw new Error(`Google photo fetch failed: ${response.status}`);
        }

        // The Google photo endpoint returns a redirect (302) to the actual image.
        // We need to follow it manually to get the binary data.
        const finalUrl = response.url;
        const imageResponse = await fetch(finalUrl);

        if (!imageResponse.ok) {
            throw new Error(`Final image fetch failed: ${imageResponse.status}`);
        }

        const buffer = await imageResponse.arrayBuffer();

        // ✅ Serve image data with proper headers
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error("❌ Error fetching photo:", err);
        res.status(500).send("Failed to fetch photo");
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
