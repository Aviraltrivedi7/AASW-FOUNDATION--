// Using @supabase/postgrest-js as a generic PostgREST client to interact with InsForge DB
const { PostgrestClient } = require('@supabase/postgrest-js');

// Ensure required environment variables are present
const insforgeUrl = process.env.INSFORGE_URL;
const insforgeKey = process.env.INSFORGE_KEY;

// ─── Enhanced Cold-Start Protection ───────────────────────────────────────
// InsForge free-tier databases go to sleep after inactivity.
// "context deadline exceeded" = the DB didn't wake up in time.
// Fix: exponential backoff, more retries, per-request timeout, warm-up ping.

const RETRY_CONFIG = {
  maxRetries: 6,            // 6 attempts total
  initialBackoff: 3000,     // Start at 3s (give DB more time)
  maxBackoff: 20000,        // Cap at 20s
  requestTimeout: 20000,    // 20s per-request timeout
  keepAliveInterval: 4 * 60 * 1000  // Ping every 4 minutes to prevent sleep
};

const fetchWithRetry = async (url, options = {}) => {
  let lastError;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    // Per-request timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check for 5xx errors (cold-start manifests as 502/503/504)
      if (!response.ok && response.status >= 500) {
        const errorText = await response.text().catch(() => '');

        // Detect "context deadline exceeded" in response body
        if (errorText.includes('context deadline') || errorText.includes('deadline exceeded')) {
          throw new Error(`Cold start: context deadline exceeded (HTTP ${response.status})`);
        }
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      // Also check 200-level responses that might contain deadline errors in body
      // (some proxies return 200 with error in body)
      return response;

    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // Don't retry on client errors (4xx) — only on timeouts/server errors
      if (err.name !== 'AbortError' && err.message && !err.message.includes('Server error') && !err.message.includes('Cold start') && !err.message.includes('fetch failed') && !err.message.includes('ECONNREFUSED') && !err.message.includes('ETIMEDOUT') && !err.message.includes('ENOTFOUND')) {
        throw err; // Non-retryable error, bail immediately
      }

      // Last attempt — return a synthetic error response instead of throwing
      // This ensures InsForge errors NEVER crash the app or reach the user
      if (attempt === RETRY_CONFIG.maxRetries - 1) {
        console.error(`[InsForge] ✗ All ${RETRY_CONFIG.maxRetries} attempts exhausted. Returning graceful error. Last: ${err.message}`);
        return new Response(JSON.stringify({ message: 'InsForge unavailable', hint: 'Database cold start' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Exponential backoff: 2s → 4s → 8s → 16s → 16s
      const delay = Math.min(
        RETRY_CONFIG.initialBackoff * Math.pow(2, attempt),
        RETRY_CONFIG.maxBackoff
      );

      console.warn(
        `[InsForge] Database waking up... retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} in ${delay / 1000}s` +
        ` | Error: ${err.name === 'AbortError' ? 'Request timed out (15s)' : err.message}`
      );

      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// ─── Warm-up Ping + Keep-Alive ────────────────────────────────────────────
// Fire a lightweight request on startup to wake the DB before real traffic hits.
// Then keep pinging every 4 minutes so the DB never goes back to sleep.

function pingDatabase(baseUrl, key, label = 'Ping') {
  const pingUrl = `${baseUrl}/api/database/records/site_stats?select=key&limit=1`;
  return fetch(pingUrl, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000)
  })
    .then(res => {
      if (res.ok) console.log(`[InsForge] ✓ ${label} successful — DB is awake`);
      else console.warn(`[InsForge] ⚠ ${label} got HTTP ${res.status}`);
      return res.ok;
    })
    .catch(() => {
      console.warn(`[InsForge] ⚠ ${label} failed`);
      return false;
    });
}

async function warmUpDatabase(baseUrl, key) {
  // Try up to 3 warm-up pings with increasing delays
  for (let i = 0; i < 3; i++) {
    const ok = await pingDatabase(baseUrl, key, `Warm-up attempt ${i + 1}`);
    if (ok) return;
    // Wait before next warm-up attempt: 3s, 6s
    await new Promise(r => setTimeout(r, 3000 * (i + 1)));
  }
  console.warn('[InsForge] ⚠ All warm-up attempts failed — DB may be slow on first request');
}

function startKeepAlive(baseUrl, key) {
  // Ping every 4 minutes to prevent the database from sleeping
  setInterval(() => {
    pingDatabase(baseUrl, key, 'Keep-alive');
  }, RETRY_CONFIG.keepAliveInterval);
  console.log(`[InsForge] ✓ Keep-alive started (every ${RETRY_CONFIG.keepAliveInterval / 60000} min)`);
}

// ─── Initialize Client ───────────────────────────────────────────────────
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
      fetch: fetchWithRetry // Inject enhanced retry logic
    })
  };
  console.log("[InsForge] ✓ Database client initialized with Enhanced Cold-Start Protection (6 retries, exponential backoff, keep-alive)");

  // Proactive warm-up — wake the DB immediately on server start
  warmUpDatabase(insforgeUrl, insforgeKey);

  // Start keep-alive pings to prevent DB from sleeping
  startKeepAlive(insforgeUrl, insforgeKey);
}

module.exports = {
  insforge
};
