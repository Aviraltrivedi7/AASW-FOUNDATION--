// Using @supabase/postgrest-js as a generic PostgREST client to interact with InsForge DB
const { PostgrestClient } = require('@supabase/postgrest-js');

// Ensure required environment variables are present
const insforgeUrl = process.env.INSFORGE_URL;
const insforgeKey = process.env.INSFORGE_KEY;

// Custom fetch wrapper to handle InsForge Cold Starts (context deadline exceeded / 5xx timeouts)
const fetchWithRetry = async (url, options, retries = 3, backoff = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      // Context deadline exceeded often results in 504 Gateway Timeout or 502/503 errors
      if (!response.ok && response.status >= 500) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[InsForge] Database waking up... retrying in ${backoff / 1000}s (Attempt ${i + 1}/${retries}). Error: ${err.message}`);
      await new Promise(res => setTimeout(res, backoff));
    }
  }
};

let insforge = null;

if (!insforgeUrl || !insforgeKey) {
  console.warn("[InsForge] ⚠️  Missing INSFORGE_URL or INSFORGE_KEY — database features disabled. Set env vars for production.");
} else {
  insforge = {
    database: new PostgrestClient(`${insforgeUrl}/api/database/records`, {
      headers: {
        apikey: insforgeKey,
        Authorization: `Bearer ${insforgeKey}`
      },
      fetch: fetchWithRetry // Inject the custom fetch to prevent crashes on cold-starts
    })
  };
  console.log("[InsForge] ✓ Database client initialized with Cold-Start Protection");
}

module.exports = {
  insforge
};
