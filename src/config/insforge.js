// Using @supabase/postgrest-js as a generic PostgREST client to interact with InsForge DB
const { PostgrestClient } = require('@supabase/postgrest-js');

// Ensure required environment variables are present
const insforgeUrl = process.env.INSFORGE_URL;
const insforgeKey = process.env.INSFORGE_KEY;

if (!insforgeUrl || !insforgeKey) {
  console.error("Missing InsForge URL or Key in environment variables!");
}

const insforge = {
  database: new PostgrestClient(`${insforgeUrl}/api/database/records`, {
    headers: {
      apikey: insforgeKey,
      Authorization: `Bearer ${insforgeKey}`
    }
  })
};

module.exports = {
  insforge
};
