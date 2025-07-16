# Data Flow
1. Docker Engine emits logs → Log Collector reads via socket.
2. Collector forwards raw lines to Chunker.
3. Chunker buffers & cleans → emits chunk event.
4. Summariser sends chunk to Gemini → receives summary.
5. Summary & metadata persisted in DB; optional raw chunk stored compressed on disk.
6. Query API serves summaries; can fetch raw chunk for follow-up Q&A.
