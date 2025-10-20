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


// ✅ /route endpoint — walking mode + step durations + arrival times
app.get("/route", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const route = await getWalkingRoute(origin, destination, apiKey);

        const totalDurationSeconds = parseFloat(route.duration.replace("s", "")) || 0;
        const totalDistanceMeters = route.distanceMeters || 1; // prevent divide by zero

        const startTime = Date.now(); // now in ms
        let cumulativeSeconds = 0;

        const stepsWithArrival = route.legs[0].steps.map((step) => {
            // Estimate duration for each step
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

        res.json({
            totalDuration: route.duration,
            totalDistance: route.distanceMeters,
            encodedPolyline: route.polyline.encodedPolyline,
            steps: stepsWithArrival,
        });
    } catch (err) {
        console.error("❌ Error computing walking route:", err);
        res.status(500).json({ error: "Something went wrong computing the walking route" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
