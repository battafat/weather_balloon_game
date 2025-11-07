import express from "express";
import fetch from "node-fetch";
import polyline from "@mapbox/polyline";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    return steps.flatMap(step => step.decodedPolyline);
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
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
        console.warn(`⚠️ No address found for query: ${query}`);
        return query; // fallback: just return original input
    }

    // Return the best match’s formatted address
    return data.results[0].formatted_address;
}



// ✅ /route endpoint — walking mode + step durations + sampled coordinates
app.get("/route", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        // ✅ Clean up origin & destination before calling Routes API
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
            const durationSeconds = (step.distanceMeters / totalDistanceMeters) * totalDurationSeconds;
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

        // ✅ Combine and sample here
        const allPoints = combineAllPolylines(stepsWithArrival);
        const sampledPoints = sampleCoordinates(allPoints, 10);

        res.json({
            totalDuration: route.duration,
            totalDistance: route.distanceMeters,
            steps: stepsWithArrival,
            sampledPoints, // 👈 Add the 10 sampled coordinates
        });
    } catch (err) {
        console.error("❌ Error computing walking route:", err);
        res.status(500).json({ error: "Something went wrong computing the walking route" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
