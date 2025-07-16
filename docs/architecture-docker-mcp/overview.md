# Overview
The architecture focuses on a lightweight Node.js service that tails Docker container logs, chunks them into manageable blobs, routes each chunk through Gemini for summarisation, and stores results for fast querying via CLI or REST.
