
export class Waypoint {
    constructor({ lat, lon, time, name, photoUrl }) {
        this.lat = lat;
        this.lon = lon;
        this.time = time ? new Date(time) : new Date();
        this.name = name || "Unknown";
        this.photoUrl = photoUrl || null;
    }

    setTime(newTime) {
        this.time = new Date(newTime);
    }
}

export async function fetchRoute(origin, destination) {
    try {
        console.log("🛰️ Calling /route with:", origin, destination);

        const response = await fetch(
            `/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
        
        );

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        // Convert the API response into Waypoint objects (for generateLandmarks)
        if (data.sampledPoints) {
            return data.sampledPoints.map((p, i) => {
                const wp = new Waypoint({ lat: p.lat, lon: p.lng });
                if (data.nearbyPhotos && data.nearbyPhotos[i]?.photo) {
                    wp.photoUrl = data.nearbyPhotos[i].photo.photoUrl;
                }
                return wp;
            });
        }

        return [];
    } catch (err) {
        console.error("❌ fetchRoute failed:", err);
        return [];
    }
}



export function parseRouteResponse(data) {
    if (!data || !data.nearbyPhotos) return [];

    return data.nearbyPhotos
        .filter((p) => p.photo && p.photo.photoUrl)
        .map(
            (p) =>
                new Waypoint({
                    lat: p.point.lat,
                    lon: p.point.lng,
                    name: p.photo.name,
                    photoUrl: p.photo.photoUrl,
                })
        );
}

export const mockRoute = [
    //Eiffel Tower
    new Waypoint({
        lat: 48.8584,
        lon: 2.2945,
    }),
    //Arc de triomphe
    new Waypoint({
        lat: 48.8738,
        lon: 2.2950,
    }),
    //Notre Dame Cathedral
    new Waypoint({
        lat: 41.7002,
        lon: 86.2379
    })
]

