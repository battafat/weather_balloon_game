// index.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

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
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});




// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});




// // index.js
// import express from "express";
// import dotenv from "dotenv";
// import "dotenv/config"; // automatically loads .env
// import path from "path";
// import { fileURLToPath } from "url";

// // Load .env variables (e.g. GOOGLE_PLACES_API_KEY)
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = 3000;


// // ✅ Serve your static frontend files from /public
// app.use(express.static(path.join(__dirname, "public")));

// // ✅ Endpoint to call Google Places API securely
// app.get("/places", async (req, res) => {
//     try {
//         const { query } = req.query; // e.g. frontend sends /places?query=pizza+near+Chicago
//         if (!query) {
//             return res.status(400).json({ error: "Missing query parameter" });
//         }

//         const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
//             query
//         )}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

//         const response = await fetch(url);
//         const data = await response.json();

//         res.json(data); // send the API results back to frontend
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Something went wrong" });
//     }
// });

// // ✅ Start the server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });



// import { createServer } from 'http';
// import { readFile } from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const PORT = 3000;

// const server = createServer(async (req, res) => {
//     // remove leading slash
//     let reqPath = req.url.startsWith('/') ? req.url.slice(1) : req.url;

//     // default to index.html
//     if (reqPath === '') reqPath = 'index.html';

//     const filePath = path.join(__dirname, 'public', reqPath);

//     try {
//         const data = await readFile(filePath);

//         // determine content type
//         const ext = path.extname(filePath).toLowerCase();
//         let contentType = 'text/html';
//         if (ext === '.js') contentType = 'text/javascript'; // <--- critical for ES modules
//         if (ext === '.css') contentType = 'text/css';
//         if (ext === '.png') contentType = 'image/png';
//         if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

//         res.writeHead(200, { 'Content-Type': contentType });
//         res.end(data);
//     } catch (err) {
//         res.writeHead(404);
//         res.end('Not found');
//     }
// });

// server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
